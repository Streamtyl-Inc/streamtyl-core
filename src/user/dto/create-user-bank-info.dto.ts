import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

export class CreateUserBankInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumberString()
  @Length(10)
  account_number: string;

  @IsString()
  @IsNotEmpty()
  account_name: string;
}
