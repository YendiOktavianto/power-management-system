import { IsOptional, IsObject } from 'class-validator';

export class UpdateContentDto {
  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  updatedBy?: string;
}
