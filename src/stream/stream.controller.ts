import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { ReqUser } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { StreamService } from './stream.service';
import { stream } from 'src/utils/route';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';

@Controller(stream)
@UseGuards(JwtAuthGuard)
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @Req() req: Request & ReqUser,
    @Body() createStreamDto: CreateStreamDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    return await this.streamService.create(
      req.user.id,
      createStreamDto,
      thumbnail,
    );
  }

  @Get()
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.streamService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.streamService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: Request & ReqUser,
    @Body() updateStreamDto: UpdateStreamDto,
  ) {
    return await this.streamService.update(id, req.user.id, updateStreamDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request & ReqUser) {
    return await this.streamService.remove(id, req.user.id);
  }

  @Post(':id/comment')
  async createComment(
    @Param('id') id: string,
    @Req() req: Request & ReqUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.streamService.createComment(
      id,
      req.user.id,
      createCommentDto,
    );
  }

  @Get(':id/comment')
  async getStreamComments(
    @Paginate() query: PaginateQuery,
    @Param('id') id: string,
  ) {
    return await this.streamService.getStreamComments(id, query);
  }

  @Delete(':id/comment/:comment_id')
  async deleteStreamComment(
    @Param('id') id: string,
    @Param('comment_id') commentId: string,
    @Req() req: Request & ReqUser,
  ) {
    return await this.streamService.deleteStreamComment(
      id,
      commentId,
      req.user.id,
    );
  }

  @Patch(':id/watch')
  async watchStream(@Param('id') id: string) {
    return await this.streamService.watchStream(id);
  }
}
