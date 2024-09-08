import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly userService: UserService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const user = await this.userService.findOne(userId);

    const post = this.postRepository.create(createPostDto);

    post.user = user;

    await this.postRepository.save(post);

    delete post.user;

    return post;
  }

  async findAll(query: PaginateQuery) {
    const posts = await paginate(query, this.postRepository, {
      sortableColumns: ['created_at'],
      nullSort: 'last',
      relations: ['user', 'user.wallet'],
      defaultSortBy: [['created_at', 'DESC']],
      searchableColumns: [],
      filterableColumns: {},
    });

    posts.data.forEach((post) => {
      delete post.user.password;
      delete post.user.password_changed_at;
      delete post.user.password_reset_token;
      delete post.user.password_reset_token_expires;
    });

    return posts;
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { user: { wallet: true } },
    });

    if (!post) throw new NotFoundException('post not found');

    delete post.user.password_reset_token_expires;
    delete post.user.password_reset_token;
    delete post.user.password_changed_at;
    delete post.user.password;

    return post;
  }
}
