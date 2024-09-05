import { IsEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Role } from '../entities/user.entity';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstname: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  occupation: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsUrl()
  avatar: string;

  @IsEmpty()
  roles: Role[];

  @IsEmpty()
  password: string;

  @IsEmpty()
  email: string;

  @IsEmpty()
  is_verified: boolean;
}
