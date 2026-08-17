import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import * as fs from 'fs';
import { join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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
    }
    return this.writeLocal(file, 'productos');
  }

  async uploadVideo(file: Express.Multer.File): Promise<{ url: string; cardUrl: string }> {
    if (this.useCloudinary) {
      const url = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'punto_zapas/videos', resource_type: 'video' },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Video upload failed'));
            resolve(result.secure_url);
          },
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
      return {
        url: this.cloudinaryVideoVariant(url, 'detail'),
        cardUrl: this.cloudinaryVideoVariant(url, 'card'),
      };
    }

    const url = this.writeLocal(file, 'productos');
    const cardUrl = await this.transcodeCardVersion(url);
    return { url, cardUrl };
  }

  cloudinaryVideoVariant(url: string, view: 'card' | 'detail'): string {
    if (!url.includes('/video/upload/')) return url;
    const transform = view === 'card'
      ? 'q_auto:eco,w_640,c_limit,vc_auto,ac_none,du_12'
      : 'q_auto,w_1280,c_limit,vc_auto';
    return url.replace('/video/upload/', `/video/upload/${transform}/`);
  }

  private writeLocal(file: Express.Multer.File, folder: string): string {
    const uploadPath = join(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file.originalname.split('.').pop() || 'mp4').toLowerCase();
    const filename = `${uniqueSuffix}.${ext}`;
    fs.writeFileSync(join(uploadPath, filename), file.buffer);
    return `/uploads/${folder}/${filename}`;
  }

  private async transcodeCardVersion(originalUrl: string): Promise<string> {
    const relative = originalUrl.replace(/^\//, '');
    const inputPath = join(process.cwd(), relative);
    const cardPath = inputPath.replace(/(\.[^.]+)$/, '_card.mp4');
    const cardUrl = originalUrl.replace(/(\.[^.]+)$/, '_card.mp4');

    try {
      await execFileAsync('ffmpeg', [
        '-y',
        '-i', inputPath,
        '-t', '12',
        '-vf', 'scale=640:-2',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '30',
        '-an',
        '-movflags', '+faststart',
        cardPath,
      ], { timeout: 120000 });
      return cardUrl;
    } catch (error) {
      this.logger.warn(`No se pudo transcodificar el video de catálogo, se usará el original. ${error}`);
      return originalUrl;
    }
  }
}
