import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInMinutes } from 'date-fns';
import { assign } from 'lodash';
import { Repository } from 'typeorm';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    return comment;
  }

  async editComment(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.findOne(id);

    if (comment.user.id !== userId)
      throw new UnauthorizedException('Unable to perform this action');

    if (differenceInMinutes(new Date(), new Date(comment.created_at)) > 10)
      throw new BadRequestException('unable to edit comment');

    assign(comment, updateCommentDto);

    await this.commentRepository.save(comment);

    delete comment.user;

    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.findOne(commentId);

    if (comment.user.id !== userId)
      throw new UnauthorizedException('Unable to perform this action');

    await this.commentRepository.delete(commentId);

    return null;
  }
}
