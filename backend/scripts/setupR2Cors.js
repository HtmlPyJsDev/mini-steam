require('dotenv').config();

const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

async function main() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const allowedOrigins = (process.env.R2_CORS_ALLOWED_ORIGINS ||
    process.env.CLIENT_URL ||
    'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      'Missing R2 env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME'
    );
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const corsConfig = {
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: allowedOrigins,
          AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
          AllowedHeaders: ['*'],
          ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  };

  await client.send(new PutBucketCorsCommand(corsConfig));
  // eslint-disable-next-line no-console
  console.log(
    `[setup:r2-cors] CORS applied to bucket ${bucket} for origins:`,
    allowedOrigins
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[setup:r2-cors] Failed:', err);
  process.exit(1);
});
