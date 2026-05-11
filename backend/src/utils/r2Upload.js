const crypto = require('crypto');
const path = require('path');
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  UploadPartCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const { getR2Client, getR2Config } = require('../config/r2');

function buildKey(prefix, originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  const safeBase = path
    .basename(originalName || 'file', ext)
    .replace(/[^a-z0-9._-]+/gi, '-')
    .toLowerCase()
    .slice(0, 60) || 'file';
  const stamp = Date.now();
  const rand = crypto.randomBytes(6).toString('hex');
  return `${prefix.replace(/\/$/, '')}/${stamp}-${rand}-${safeBase}${ext}`;
}

async function uploadBufferToR2({ buffer, key, contentType }) {
  const cfg = getR2Config();
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
    })
  );

  return {
    key,
    publicUrl: cfg.publicBaseUrl
      ? `${cfg.publicBaseUrl.replace(/\/$/, '')}/${key}`
      : '',
  };
}

async function deleteFromR2(key) {
  if (!key) return;
  const cfg = getR2Config();
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
    })
  );
}

async function getDownloadUrl(key) {
  const cfg = getR2Config();

  if (!cfg.usePresignedUrls && cfg.publicBaseUrl) {
    return `${cfg.publicBaseUrl.replace(/\/$/, '')}/${key}`;
  }

  const client = getR2Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
    }),
    { expiresIn: cfg.presignedTtlSeconds }
  );
}

async function getPresignedPutUrl({ key, contentType, ttlSeconds = 3600 }) {
  const cfg = getR2Config();
  const client = getR2Client();

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    }),
    { expiresIn: ttlSeconds }
  );

  return {
    uploadUrl,
    key,
    publicUrl: cfg.publicBaseUrl
      ? `${cfg.publicBaseUrl.replace(/\/$/, '')}/${key}`
      : '',
  };
}

async function createMultipartUpload({ key, contentType }) {
  const cfg = getR2Config();
  const client = getR2Client();
  const out = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: cfg.bucket,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    })
  );
  return {
    uploadId: out.UploadId,
    key,
  };
}

async function getPresignedPartUrls({ key, uploadId, partNumbers, ttlSeconds = 3600 }) {
  const cfg = getR2Config();
  const client = getR2Client();
  const urls = [];
  for (const partNumber of partNumbers) {
    const url = await getSignedUrl(
      client,
      new UploadPartCommand({
        Bucket: cfg.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      }),
      { expiresIn: ttlSeconds }
    );
    urls.push({ partNumber, url });
  }
  return urls;
}

async function completeMultipartUpload({ key, uploadId, parts }) {
  const cfg = getR2Config();
  const client = getR2Client();
  const sorted = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: cfg.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: sorted },
    })
  );
  return {
    key,
    publicUrl: cfg.publicBaseUrl ? `${cfg.publicBaseUrl.replace(/\/$/, '')}/${key}` : '',
  };
}

async function abortMultipartUpload({ key, uploadId }) {
  const cfg = getR2Config();
  const client = getR2Client();
  await client.send(
    new AbortMultipartUploadCommand({
      Bucket: cfg.bucket,
      Key: key,
      UploadId: uploadId,
    })
  );
}

module.exports = {
  buildKey,
  uploadBufferToR2,
  deleteFromR2,
  getDownloadUrl,
  getPresignedPutUrl,
  createMultipartUpload,
  getPresignedPartUrls,
  completeMultipartUpload,
  abortMultipartUpload,
};
