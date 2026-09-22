import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import AppError from '../utils/AppError';
import config from '../config/env';

// Base upload directory
const UPLOAD_ROOT = path.join(__dirname, '..', '..', config.upload.dir || 'uploads');
const USED_PARTS_DIR = path.join(UPLOAD_ROOT, 'used-parts');

// Ensure directory exists
if (!fs.existsSync(USED_PARTS_DIR)) {
  fs.mkdirSync(USED_PARTS_DIR, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(USED_PARTS_DIR)) {
      fs.mkdirSync(USED_PARTS_DIR, { recursive: true });
    }
    cb(null, USED_PARTS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `part_${sanitizedBase || 'img'}_${uniqueSuffix}${ext}`);
  },
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = (config.upload.maxSizeMb || 5) * 1024 * 1024; // Default 5MB

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP image formats are permitted.', 400));
  }
};

export const uploadUsedPartPhotos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 6, // Up to 6 photos per used-part listing
  },
});
