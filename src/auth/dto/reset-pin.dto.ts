import { IsNumberString, Length } from 'class-validator';

export class ResetPinDto {
  @IsNumberString()
  current_pin: string;

  @IsNumberString()
  @Length(6)
  pin: string;
}
