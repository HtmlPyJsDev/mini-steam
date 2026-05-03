const { S3Client } = require('@aws-sdk/client-s3');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getR2Config() {
  return {
    accountId: requireEnv('R2_ACCOUNT_ID'),
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    bucket: requireEnv('R2_BUCKET_NAME'),
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL || '',
    usePresignedUrls: String(process.env.R2_USE_PRESIGNED_URLS || 'false').toLowerCase() === 'true',
    presignedTtlSeconds: Number(process.env.PRESIGNED_URL_TTL_SECONDS || 3600),
  };
}

let cachedClient = null;

function getR2Client() {
  if (cachedClient) return cachedClient;

  const cfg = getR2Config();

  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  return cachedClient;
}

module.exports = {
  getR2Client,
  getR2Config,
};
