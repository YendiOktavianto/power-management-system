// apps/backend/src/modules/general-info/dto/by-device.dto.ts
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ByDeviceDto {
  @Type(() => Number) // ubah dari string → number
  @IsInt()
  @Min(1)
  deviceId!: number;
}
