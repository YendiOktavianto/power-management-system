// apps/backend/src/modules/general-info/dto/verify-qr.dto.ts
import { Type } from 'class-transformer';
import { IsInt, Min, IsString } from 'class-validator';

export class VerifyQrDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  deviceId!: number;

  @IsString()
  token!: string;
}
