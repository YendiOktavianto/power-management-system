import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePhotoDto {
  @IsString()
  @IsNotEmpty()
  base64Image: string;
}
