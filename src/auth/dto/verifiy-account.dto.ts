import { IsNumberString } from 'class-validator';

export class VerifiyAccountDto {
  @IsNumberString()
  code: string;
}
