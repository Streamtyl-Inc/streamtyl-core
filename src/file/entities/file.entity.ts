import { IsEnum, IsString, IsUrl } from 'class-validator';
import { BaseTable } from 'src/base/base.table';
import { Column, Entity } from 'typeorm';

export enum FileType {
  AUDIO = 'audio',
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity({ name: 'files' })
export class File extends BaseTable {
  @Column({ type: 'varchar' })
  @IsUrl()
  url: string;

  @Column({ type: 'varchar' })
  @IsString()
  key: string;

  @Column({ type: 'varchar' })
  @IsString()
  bucket: string;

  @Column({ type: 'enum', enum: FileType })
  @IsEnum(FileType)
  type: FileType;
}
