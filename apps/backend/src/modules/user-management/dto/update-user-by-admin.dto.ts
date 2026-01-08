import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserByAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;
}
