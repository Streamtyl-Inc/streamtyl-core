import { IsDate, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseTable } from 'src/base/base.table';
import { Comment } from 'src/comment/entities/comment.entity';
import { File } from 'src/file/entities/file.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'streams' })
export class Stream extends BaseTable {
  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  stream_key: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  playback_id: string;

  @Column({ type: 'varchar', default: null })
  @IsString()
  @IsNotEmpty()
  stream_id: string;

  @Column({ type: 'varchar', default: null })
  @IsString()
  @IsNotEmpty()
  stream_name: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  creator_name: string;

  @Column({ type: 'varchar', default: null })
  recording_url: string;

  @Column({ type: 'varchar', default: null })
  @IsDate()
  streaming_time: Date;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  comment_count: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  @IsString()
  pastel_result_id: string;

  @Column({ type: 'int', default: 0 })
  @IsInt()
  watch_count: number;

  @OneToMany(() => Comment, (comment) => comment, { cascade: true })
  comments: Comment[];

  @ManyToOne(() => User)
  user: User;

  @OneToOne(() => File, { eager: true })
  @JoinColumn()
  thumbnail: File;
}
