import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { ReqUser } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { post } from 'src/utils/route';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@Controller(post)
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(
    @Req() req: Request & ReqUser,
    @Body() createPostDto: CreatePostDto,
  ) {
    return await this.postService.create(req.user.id, createPostDto);
  }

  @Get()
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.postService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postService.findOne(id);
  }
}
