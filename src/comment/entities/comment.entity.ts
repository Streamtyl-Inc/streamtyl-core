import { IsNotEmpty, IsString } from 'class-validator';
import { BaseTable } from 'src/base/base.table';
import { Stream } from 'src/stream/entities/stream.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'comments' })
export class Comment extends BaseTable {
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  comment_text: string;

  @ManyToOne(() => Stream, (stream) => stream.comments)
  stream: Stream;

  @ManyToOne(() => User)
  user: User;
}
