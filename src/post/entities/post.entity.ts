import { IsNotEmpty, IsString } from 'class-validator';
import { BaseTable } from 'src/base/base.table';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'posts' })
export class Post extends BaseTable {
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  post_text: string;

  @ManyToOne(() => User)
  user: User;
}
