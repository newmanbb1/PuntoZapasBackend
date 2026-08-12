import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private useCloudinary = false;

  constructor() {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      this.useCloudinary = true;
      this.logger.log('Cloudinary está configurado correctamente.');
    } else {
      this.logger.warn('Credenciales de Cloudinary no encontradas. Usando almacenamiento local.');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (this.useCloudinary) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'punto_zapas' },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Upload failed'));
            resolve(result.secure_url);
          },
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } else {
      const uploadPath = join(process.cwd(), 'uploads', 'productos');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      const filename = `${uniqueSuffix}.${ext}`;
      fs.writeFileSync(join(uploadPath, filename), file.buffer);
      return `/uploads/productos/${filename}`;
    }
  }
}
