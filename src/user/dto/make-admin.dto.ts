import { IsEmail } from 'class-validator';

export class MakeAdminDto {
  @IsEmail()
  email: string;
}
