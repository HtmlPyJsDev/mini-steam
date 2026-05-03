const multer = require('multer');

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB per image

function imageFileFilter(_req, file, cb) {
  if (file.fieldname === 'cover' || file.fieldname === 'screenshots') {
    if (IMAGE_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`Invalid image type for ${file.fieldname}: ${file.mimetype}`));
  }
  return cb(new Error(`Unexpected upload field: ${file.fieldname}`));
}

const storage = multer.memoryStorage();

const imageUploader = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

const gameImagesUpload = imageUploader.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 },
]);

module.exports = {
  gameImagesUpload,
  MAX_IMAGE_SIZE,
};
