import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { FileType } from '../entities/file.entity';

export class CreateFileDto {
  @IsUrl()
  url: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  bucket: string;

  @IsEnum(FileType)
  type: FileType;
}
