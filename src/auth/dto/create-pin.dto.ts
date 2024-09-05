import { IsNumberString, Length } from 'class-validator';

export class CreatePinDto {
  @IsNumberString()
  @Length(6)
  pin: string;
}
