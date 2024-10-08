import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  post_text: string;
}
