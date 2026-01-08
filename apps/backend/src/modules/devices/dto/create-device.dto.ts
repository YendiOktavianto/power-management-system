import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  serial_number!: string;

  // username pemilik
  @IsString()
  @IsNotEmpty()
  username!: string;

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

  // bebas sesuai opsi di FE mu
  @IsString()
  @IsNotEmpty()
  wattage!: string;

  @IsString()
  @IsOptional()
  phase?: string; // default '1-phase'
}
