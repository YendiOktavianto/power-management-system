import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDeviceDto {
  @IsString()
  @IsNotEmpty()
  address_name!: string;

  @IsString()
  @IsOptional()
  detail_address_name?: string;

  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  long!: number;

  @IsString()
  @IsNotEmpty()
  segment!: string;
}
