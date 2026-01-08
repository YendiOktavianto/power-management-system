import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileStoreService {
  private dataDir = process.env.DATA_DIR || 'data';

  constructor() {
    if (!existsSync(this.dataDir)) mkdirSync(this.dataDir, { recursive: true });
  }

  readJSON<T>(fileName: string, fallback: T): T {
    const p = join(this.dataDir, fileName);
    if (!existsSync(p)) return fallback;
    try {
      const raw = readFileSync(p, 'utf-8');
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  writeJSON(fileName: string, data: unknown) {
    const p = join(this.dataDir, fileName);
    writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
  }
}
