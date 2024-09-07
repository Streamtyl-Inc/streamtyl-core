import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { CreateFileDto } from './dto/create-file.dto';
import { File, FileType } from './entities/file.entity';

export type UploadOptions = {
  dataBuffer: Buffer;
  filename: string;
  folder: Folders;
  fileType: FileType;
};

export enum Folders {
  USERS = 'users',
  COVERS = 'covers',
  POSTS = 'posts',
  ASSETS = 'assets',
  STREAM = 'streams',
}

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
  ) {}

  s3 = new S3();

  async createFile(createFileDto: CreateFileDto) {
    const file = this.fileRepository.create(createFileDto);

    await this.fileRepository.save(file);

    return file;
  }

  async uploadFile(uploadOptions: UploadOptions) {
    const uploadResult = await this.s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: uploadOptions.dataBuffer,
        Key: `${uploadOptions.folder}/${v4()}-${uploadOptions.filename}`,
      })
      .promise();

    const file = this.fileRepository.create({
      key: uploadResult.Key,
      url: uploadResult.Location,
      bucket: uploadResult.Bucket,
      type: uploadOptions.fileType,
    });

    await this.fileRepository.save(file);

    return file;
  }

  async uploadPostFile(uploadOptions: UploadOptions) {
    const uploadResult = await this.s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: uploadOptions.dataBuffer,
        Key: `${uploadOptions.folder}/${v4()}-${uploadOptions.filename}`,
      })
      .promise();

    return {
      key: uploadResult.Key,
      url: uploadResult.Location,
      bucket: uploadResult.Bucket,
      type: uploadOptions.fileType,
    };
  }

  async deletePostFile(bucket: string, key: string) {
    await this.s3
      .deleteObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();
  }

  async deleteFile(id: string) {
    const file = await this.fileRepository.findOneBy({ id });

    if (!file) return null;

    await this.s3
      .deleteObject({
        Bucket: file.bucket,
        Key: file.key,
      })
      .promise();

    await this.fileRepository.delete(id);

    return null;
  }
}
