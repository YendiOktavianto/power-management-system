import { IsISO8601, IsInt, IsNumberString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportQueryDto {
  @IsNumberString()
  deviceId!: string;

  // ❗ sekarang optional
  @IsOptional()
  @IsISO8601()
  from?: string;

  // ❗ optional juga
  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize = 10000000;
}
