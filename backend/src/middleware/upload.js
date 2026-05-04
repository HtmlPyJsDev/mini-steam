const multer = require('multer');

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB per image
const MAX_AVATAR_SIZE = 3 * 1024 * 1024; // 3 MB

function imageFileFilter(_req, file, cb) {
  if (file.fieldname === 'cover' || file.fieldname === 'screenshots') {
    if (IMAGE_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`Invalid image type for ${file.fieldname}: ${file.mimetype}`));
  }
  return cb(new Error(`Unexpected upload field: ${file.fieldname}`));
}

function singleImageFilter(_req, file, cb) {
  if (file.fieldname !== 'image') {
    return cb(new Error(`Unexpected upload field: ${file.fieldname}`));
  }
  if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`Invalid image type: ${file.mimetype}`));
  }
  return cb(null, true);
}

function avatarFileFilter(_req, file, cb) {
  if (file.fieldname !== 'avatar') {
    return cb(new Error(`Unexpected upload field: ${file.fieldname}`));
  }
  if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`Invalid avatar image type: ${file.mimetype}`));
  }
  return cb(null, true);
}

const storage = multer.memoryStorage();

const imageUploader = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

const avatarUploader = multer({
  storage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: MAX_AVATAR_SIZE },
});

const gameImagesUpload = imageUploader.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 },
]);

const avatarUpload = avatarUploader.single('avatar');

const singleImageUploader = multer({
  storage,
  fileFilter: singleImageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
});

const updateImageUpload = singleImageUploader.single('image');

module.exports = {
  gameImagesUpload,
  avatarUpload,
  updateImageUpload,
  MAX_IMAGE_SIZE,
  MAX_AVATAR_SIZE,
};
