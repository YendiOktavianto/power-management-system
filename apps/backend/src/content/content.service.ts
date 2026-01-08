import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentEntity } from '../database/entities/content.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentEntity)
    private readonly repo: Repository<ContentEntity>,
  ) {}

  async get<T = any>(key: string): Promise<T> {
    const row = await this.repo.findOne({ where: { key } });
    return (row?.data as T) ?? ({} as T);
  }

  /**
   * Simpan/overwrite data untuk key tertentu (upsert).
   * Jika perlu merge parsial, lakukan merge di controller sebelum kirim ke service.
   */
  async put(key: string, data: unknown, updatedBy?: string) {
    const existing = await this.repo.findOne({ where: { key } });
    if (existing) {
      existing.data = data as any;
      existing.updatedBy = updatedBy ?? existing.updatedBy;
      await this.repo.save(existing);
      return { ok: true, id: existing.id, updated: true };
    }
    const created = this.repo.create({ key, data: data as any, updatedBy });
    await this.repo.save(created);
    return { ok: true, id: created.id, created: true };
  }
}
