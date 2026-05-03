const multer = require('multer');

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const GAME_FILE_MIME_TYPES = new Set([
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-apple-diskimage',
  'application/x-debian-package',
  'application/octet-stream',
]);

const GAME_FILE_EXTENSIONS = /\.(zip|rar|7z|tar|gz|tgz|exe|msi|appimage|dmg|deb|pkg|iso)$/i;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB per image
const MAX_GAME_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4 GB

function fileFilter(_req, file, cb) {
  if (file.fieldname === 'cover' || file.fieldname === 'screenshots') {
    if (IMAGE_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`Invalid image type for ${file.fieldname}: ${file.mimetype}`));
  }

  if (file.fieldname === 'gameFile') {
    if (GAME_FILE_MIME_TYPES.has(file.mimetype) || GAME_FILE_EXTENSIONS.test(file.originalname)) {
      return cb(null, true);
    }
    return cb(new Error(`Invalid game file type: ${file.mimetype}`));
  }

  return cb(new Error(`Unexpected upload field: ${file.fieldname}`));
}

const storage = multer.memoryStorage();

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_GAME_FILE_SIZE,
  },
});

const gameUpload = uploader.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 },
  { name: 'gameFile', maxCount: 1 },
]);

module.exports = {
  gameUpload,
  MAX_IMAGE_SIZE,
  MAX_GAME_FILE_SIZE,
};
