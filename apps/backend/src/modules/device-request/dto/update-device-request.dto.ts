import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDeviceRequestDto {
  @IsInt() @Min(1) id!: number;

  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status!: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  device_id?: string;
  @IsOptional()
  @IsString()
  @IsIn(['1000 VA', '2000 VA', '4000 VA', '5000 VA', '7000 VA', '10000 VA', '15000 VA'])
  wattage?: string;
}
