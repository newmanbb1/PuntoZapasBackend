import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import type { Options } from 'multer';

const VIDEO_MIME = /^(video\/(mp4|webm|quicktime|ogg)|application\/octet-stream)$/;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

export const mediaUploadOptions: Options = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_VIDEO_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'video') {
      const name = file.originalname.toLowerCase();
      const extOk = /\.(mp4|webm|mov|ogg)$/.test(name);
      if (!VIDEO_MIME.test(file.mimetype) && !extOk) {
        return cb(new BadRequestException('El video debe ser MP4, WebM o MOV (máx. 80 MB)'));
      }
      return cb(null, true);
    }
    if (file.fieldname === 'imagenes') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Solo se permiten imágenes JPEG, PNG o WebP'));
      }
      return cb(null, true);
    }
    cb(null, false);
  },
};
