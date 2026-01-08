import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/** opsional: pastikan folder upload ada */
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!existsSync(join(process.cwd(), UPLOAD_DIR))) {
  mkdirSync(join(process.cwd(), UPLOAD_DIR), { recursive: true });
}

function sanitize(original: string) {
  return original.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '') || 'file';
}

/** ✅ signature yang benar: (req, file, cb: (err, filename) => void) */
function filename(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void,
) {
  const safe = sanitize(file.originalname);
  const stamp = Date.now();
  cb(null, `${stamp}-${safe}`);
}

@Controller('api/v1')
export class UploadController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        /** ✅ signature yang benar: (req, file, cb: (err, dest) => void) */
        destination: (
          _req: Request,
          _file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => cb(null, UPLOAD_DIR),
        filename,
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      /** ✅ signature yang benar: (req, file, cb: (err, accept) => void) */
      fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: any, acceptFile: boolean) => void,
      ) => {
        const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
        if (!ok) return cb(new BadRequestException('Only image files allowed'), false);
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    // URL publik (pastikan ServeStaticModule serve /uploads)
    const url = `/uploads/${file.filename}`;
    return { url, filename: file.filename, size: file.size, mimetype: file.mimetype };
  }
}
