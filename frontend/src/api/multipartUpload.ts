import { apiRequest } from './client';

export type UploadProgress =
  | { kind: 'idle' }
  | { kind: 'presigning' }
  | { kind: 'uploading'; loaded: number; total: number }
  | { kind: 'finalizing' };

export type ProgressListener = (progress: UploadProgress) => void;

export interface MultipartInitResult {
  key: string;
  uploadId: string;
  publicUrl: string;
}

export interface SinglePresign {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface ResolvedFile {
  key: string;
  url: string;
  size: number;
}

interface PartSignedUrl {
  partNumber: number;
  url: string;
}

interface CompletedPart {
  partNumber: number;
  eTag: string;
}

const MULTIPART_THRESHOLD = 80 * 1024 * 1024;
const PART_SIZE = 16 * 1024 * 1024;
const PART_CONCURRENCY = 4;
const MAX_PART_RETRIES = 3;

interface PutOpts {
  url: string;
  body: Blob | File;
  contentType?: string;
  onProgress?: (loaded: number) => void;
  signal?: AbortSignal;
}

function putWithProgress({ url, body, contentType, onProgress, signal }: PutOpts): Promise<{ etag: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    if (contentType) xhr.setRequestHeader('Content-Type', contentType);
    if (signal) {
      if (signal.aborted) {
        reject(new Error('Aborted'));
        return;
      }
      signal.addEventListener('abort', () => xhr.abort());
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader('ETag') || xhr.getResponseHeader('etag') || '';
        resolve({ etag });
      } else {
        reject(new Error(`R2 PUT failed: HTTP ${xhr.status} ${xhr.statusText || ''}`.trim()));
      }
    };
    xhr.onerror = () => reject(new Error('R2 PUT network error'));
    xhr.onabort = () => reject(new Error('R2 PUT aborted'));
    xhr.send(body);
  });
}

async function uploadSingle(
  file: File,
  presignPath: string,
  onProgress?: ProgressListener
): Promise<ResolvedFile> {
  onProgress?.({ kind: 'presigning' });
  const presigned = await apiRequest<SinglePresign>(presignPath, {
    method: 'POST',
    body: { filename: file.name, contentType: file.type || 'application/octet-stream' },
    auth: true,
  });
  onProgress?.({ kind: 'uploading', loaded: 0, total: file.size });
  await putWithProgress({
    url: presigned.uploadUrl,
    body: file,
    contentType: file.type || 'application/octet-stream',
    onProgress: (loaded) => onProgress?.({ kind: 'uploading', loaded, total: file.size }),
  });
  return { key: presigned.key, url: presigned.publicUrl, size: file.size };
}

interface MultipartPaths {
  init: string;
  sign: string;
  complete: string;
  abort: string;
}

async function uploadMultipart(
  file: File,
  paths: MultipartPaths,
  onProgress?: ProgressListener
): Promise<ResolvedFile> {
  onProgress?.({ kind: 'presigning' });
  const init = await apiRequest<MultipartInitResult>(paths.init, {
    method: 'POST',
    body: { filename: file.name, contentType: file.type || 'application/octet-stream' },
    auth: true,
  });

  const totalParts = Math.ceil(file.size / PART_SIZE);
  if (totalParts > 10000) {
    throw new Error('File too large: would require more than 10000 parts');
  }

  const partLoaded = new Array<number>(totalParts).fill(0);
  const completed: CompletedPart[] = [];
  function emitProgress() {
    const loaded = partLoaded.reduce((s, n) => s + n, 0);
    onProgress?.({ kind: 'uploading', loaded, total: file.size });
  }
  emitProgress();

  // Pre-fetch signed URLs in batches of 100 (server limit).
  const allPartNumbers: number[] = [];
  for (let i = 1; i <= totalParts; i += 1) allPartNumbers.push(i);
  const signedMap = new Map<number, string>();
  for (let i = 0; i < allPartNumbers.length; i += 100) {
    const batch = allPartNumbers.slice(i, i + 100);
    const res = await apiRequest<{ urls: PartSignedUrl[] }>(paths.sign, {
      method: 'POST',
      body: { key: init.key, uploadId: init.uploadId, partNumbers: batch },
      auth: true,
    });
    for (const u of res.urls) signedMap.set(u.partNumber, u.url);
  }

  async function uploadOnePart(partNumber: number): Promise<void> {
    const url = signedMap.get(partNumber);
    if (!url) throw new Error(`Missing signed URL for part ${partNumber}`);
    const start = (partNumber - 1) * PART_SIZE;
    const end = Math.min(start + PART_SIZE, file.size);
    const blob = file.slice(start, end);

    let lastErr: unknown = null;
    for (let attempt = 0; attempt < MAX_PART_RETRIES; attempt += 1) {
      try {
        const { etag } = await putWithProgress({
          url,
          body: blob,
          contentType: file.type || 'application/octet-stream',
          onProgress: (loaded) => {
            partLoaded[partNumber - 1] = loaded;
            emitProgress();
          },
        });
        if (!etag) {
          throw new Error(
            `Part ${partNumber}: ETag missing in response — check R2 CORS ExposeHeaders`
          );
        }
        partLoaded[partNumber - 1] = blob.size;
        emitProgress();
        completed.push({ partNumber, eTag: etag });
        return;
      } catch (err) {
        lastErr = err;
        if (attempt < MAX_PART_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(`Part ${partNumber} failed`);
  }

  // Run with limited concurrency.
  const queue = [...allPartNumbers];
  const workers: Promise<void>[] = [];
  let aborted = false;
  async function worker() {
    while (queue.length > 0) {
      if (aborted) return;
      const next = queue.shift();
      if (next === undefined) return;
      await uploadOnePart(next);
    }
  }
  for (let i = 0; i < Math.min(PART_CONCURRENCY, totalParts); i += 1) {
    workers.push(worker());
  }
  try {
    await Promise.all(workers);
  } catch (err) {
    aborted = true;
    try {
      await apiRequest<{ ok: boolean }>(paths.abort, {
        method: 'POST',
        body: { key: init.key, uploadId: init.uploadId },
        auth: true,
      });
    } catch {
      // ignore
    }
    throw err;
  }

  onProgress?.({ kind: 'finalizing' });
  const result = await apiRequest<{ key: string; publicUrl: string }>(paths.complete, {
    method: 'POST',
    body: { key: init.key, uploadId: init.uploadId, parts: completed },
    auth: true,
  });

  return { key: result.key, url: result.publicUrl, size: file.size };
}

export interface UploadOptions {
  presignPath: string;
  multipartPaths: MultipartPaths;
  onProgress?: ProgressListener;
}

export async function uploadGameFileSmart(
  file: File,
  opts: UploadOptions
): Promise<ResolvedFile> {
  if (file.size <= MULTIPART_THRESHOLD) {
    return uploadSingle(file, opts.presignPath, opts.onProgress);
  }
  return uploadMultipart(file, opts.multipartPaths, opts.onProgress);
}
