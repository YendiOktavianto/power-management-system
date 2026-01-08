import { IsNotEmpty, IsNumberString } from 'class-validator';

export class HomeQueryDto {
  @IsNotEmpty()
  @IsNumberString()
  deviceId!: string;
}
