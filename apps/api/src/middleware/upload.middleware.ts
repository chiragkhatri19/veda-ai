import multer from 'multer';
import type { Request } from 'express';

const FIVE_MB = 5 * 1024 * 1024;

const ALLOWED_MIMETYPES = new Set([
  'text/plain',
  'text/csv',
  'application/pdf',
]);

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIMETYPES.has(file.mimetype) || file.originalname.endsWith('.txt')) {
    cb(null, true);
  } else {
    cb(new Error('Only plain text files are accepted'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: FIVE_MB },
  fileFilter,
});
