import { BaseTable } from '../../base/base.table';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { IsNumberString, IsString } from 'class-validator';
import { User } from './user.entity';

@Entity({ name: 'user-banks' })
export class UserBank extends BaseTable {
  @Column({ type: 'varchar' })
  @IsString()
  name: string;

  @Column({ type: 'varchar' })
  @IsString()
  slug: string;

  @Column({ type: 'varchar' })
  @IsString()
  code: string;

  @Index()
  @Column({ type: 'varchar', unique: true })
  @IsNumberString()
  account_number: string;

  @Column({ type: 'varchar' })
  @IsString()
  account_name: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
