import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as sharp from 'sharp';
import { Comment } from 'src/comment/entities/comment.entity';
import { FileType } from 'src/file/entities/file.entity';
import { FileService, Folders } from 'src/file/file.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateStreamDto } from './dto/create-stream.dto';
import { Stream } from './entities/stream.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { assign } from 'lodash';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

  async create(
    userId: string,
    createStreamDto: CreateStreamDto,
    thumbnailFile: Express.Multer.File,
  ) {
    const user = await this.userService.findOne(userId);

    if (!thumbnailFile) throw new BadRequestException('Thumbnail not found');

    if (!thumbnailFile.mimetype.includes('image'))
      throw new BadRequestException('Not an image');

    const { size } = await sharp(thumbnailFile.buffer).metadata();

    if (size > 500000) throw new BadRequestException('Thumbnail is too large');

    const thumbnail = await this.fileService.uploadFile({
      dataBuffer: thumbnailFile.buffer,
      filename: thumbnailFile.originalname,
      folder: Folders.STREAM,
      fileType: FileType.IMAGE,
    });

    const stream = this.streamRepository.create(createStreamDto);

    stream.user = user;
    stream.thumbnail = thumbnail;

    await this.streamRepository.save(stream);

    delete stream.user;

    return stream;
  }

  async findAll(query: PaginateQuery) {
    const queryBuilder = this.streamRepository
      .createQueryBuilder('streams')
      .leftJoinAndSelect('streams.user', 'user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .leftJoinAndSelect('streams.thumbnail', 'thumbnail')
      .select([
        'streams',
        'user.id',
        'user.firstname',
        'user.lastname',
        'user.avatar',
        'wallet',
      ]);

    return await paginate(query, queryBuilder, {
      sortableColumns: ['id', 'created_at', 'streaming_time'],
      nullSort: 'last',
      defaultSortBy: [['streaming_time', 'DESC']],
      searchableColumns: [],
      filterableColumns: {},
    });
  }

  async getUserStreams(userId: string, query: PaginateQuery) {
    const queryBuilder = this.streamRepository
      .createQueryBuilder('streams')
      .leftJoinAndSelect('streams.user', 'user')
      .leftJoinAndSelect('streams.thumbnail', 'thumbnail')
      .leftJoinAndSelect('streams.wallet', 'wallet')
      .where('user.id = :user_id', { user_id: userId })
      .select([
        'streams',
        'user.id',
        'user.firstname',
        'user.lastname',
        'user.avatar',
        'thumbnail',
        'wallet',
      ]);

    return await paginate(query, queryBuilder, {
      sortableColumns: ['id', 'created_at', 'streaming_time'],
      nullSort: 'last',
      defaultSortBy: [['streaming_time', 'DESC']],
      searchableColumns: [],
      filterableColumns: {},
    });
  }

  async findOne(id: string) {
    const stream = await this.streamRepository.findOne({
      where: { id },
      relations: { user: { wallet: true }, thumbnail: true },
    });

    if (!stream) throw new NotFoundException('Stream not found');

    delete stream.user.password;
    delete stream.user.password_changed_at;
    delete stream.user.password_reset_token;
    delete stream.user.password_changed_at;

    return stream;
  }

  async update(id: string, userId: string, updateStreamDto: UpdateStreamDto) {
    const stream = await this.findOne(id);

    if (stream.user.id !== userId)
      throw new UnauthorizedException('Action not allowed');

    assign(stream, updateStreamDto);

    await this.streamRepository.save(stream);

    delete stream.user;

    return stream;
  }

  async remove(id: string, userId: string) {
    const stream = await this.findOne(id);

    if (stream.user.id !== userId)
      throw new UnauthorizedException('Action not allowed');

    await this.streamRepository.delete(id);

    return null;
  }

  async createComment(
    id: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const user = await this.userService.findOne(userId);

    const stream = await this.findOne(id);

    const comment = this.commentRepository.create(createCommentDto);

    comment.user = user;
    comment.stream = stream;

    stream.comment_count += 1;

    await this.commentRepository.save(comment);
    await this.streamRepository.save(stream);

    delete comment.user;
    delete comment.stream;

    return comment;
  }

  async getStreamComments(id: string, query: PaginateQuery) {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comments')
      .leftJoin('comments.stream', 'stream')
      .leftJoinAndSelect('comments.user', 'user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('stream.id = :id', { id })
      .select([
        'comments',
        'user.id',
        'user.firstname',
        'user.lastname',
        'user.avatar',
        'wallet',
      ]);
    return await paginate(query, queryBuilder, {
      sortableColumns: ['id', 'created_at'],
      nullSort: 'last',
      defaultSortBy: [['created_at', 'DESC']],
      searchableColumns: [],
      filterableColumns: {},
    });
  }

  async findOneComment(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: {
        user: true,
        stream: true,
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    return comment;
  }

  async deleteStreamComment(id: string, commentId: string, userId: string) {
    const [stream, comment, user] = await Promise.all([
      this.findOne(id),
      this.findOneComment(commentId),
      this.userService.findOne(userId),
    ]);

    if (comment.user.id !== user.id && comment.stream.id !== stream.id)
      throw new UnauthorizedException('Unable to perform this action');

    await this.commentRepository.delete(comment.id);

    stream.comment_count -= 1;

    await this.streamRepository.save(stream);

    return null;
  }

  async watchStream(id: string) {
    const stream = await this.findOne(id);

    stream.watch_count += 1;

    await this.streamRepository.save(stream);

    delete stream.user;

    return stream;
  }
}
