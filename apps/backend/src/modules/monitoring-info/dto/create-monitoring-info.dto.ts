import { IsInt, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class CreateMonitoringInfoDto {
  @IsInt()
  device_id!: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string; // YYYY-MM-DD

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  time!: string; // HH:MM:SS

  @IsOptional()
  @IsNumber()
  voltage?: number;

  @IsOptional()
  @IsNumber()
  current?: number;

  @IsOptional()
  @IsNumber()
  frequency?: number;

  @IsOptional()
  @IsNumber()
  power_factor?: number;

  @IsOptional()
  @IsNumber()
  power?: number;

  @IsOptional()
  @IsNumber()
  total_energy_usage!: number;

  @IsOptional()
  @IsNumber()
  total_energy_usage_today?: number;

  @IsOptional()
  @IsNumber()
  total_energy_usage_mtd: number;

  @IsOptional()
  @IsInt()
  cost_id?: number;
}
