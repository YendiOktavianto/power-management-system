import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class ProvisioningBaseDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(3, 60)
  username!: string;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  orgName!: string;

  @IsUUID()
  parentOrgId!: string;
}
