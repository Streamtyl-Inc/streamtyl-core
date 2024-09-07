import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStreamDto {
  @IsString()
  @IsNotEmpty()
  stream_key: string;

  @IsString()
  @IsNotEmpty()
  stream_id: string;

  @IsString()
  @IsNotEmpty()
  playback_id: string;

  @IsString()
  @IsNotEmpty()
  creator_name: string;

  @IsString()
  @IsNotEmpty()
  stream_name: string;

  @IsOptional()
  recording_url: string;

  @IsString()
  @IsNotEmpty()
  streaming_time: Date;
}
