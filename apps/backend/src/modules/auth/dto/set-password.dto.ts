import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  inviteToken!: string;

  @IsString()
  @Length(8, 72)
  newPassword!: string;
}
