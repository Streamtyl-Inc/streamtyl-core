import * as bcrypt from 'bcrypt';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsString,
  IsUrl,
} from 'class-validator';
import { capitalize } from 'lodash';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { BaseTable } from '../../base/base.table';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

@Entity({ name: 'users' })
export class User extends BaseTable {
  @Column({ type: 'varchar' })
  @IsString()
  firstname: string;

  @Column({ type: 'varchar' })
  @IsString()
  lastname: string;

  @Column({ type: 'varchar', unique: true })
  @Index()
  @IsEmail()
  email: string;

  @Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
  @IsEnum(Role)
  roles: Role[];

  @Column({ type: 'text' })
  @IsString()
  password: string;

  @Column({ type: 'timestamp', default: null })
  @IsDateString()
  password_changed_at: Date;

  @Column({ type: 'varchar', default: null, nullable: true })
  @IsString()
  password_reset_token: string;

  @Column({ type: 'varchar', default: null })
  @IsUrl()
  avatar: string;

  @Column({
    type: 'timestamp',
    default: null,
    nullable: true,
  })
  @IsDateString()
  password_reset_token_expires: Date;

  @OneToOne(() => Wallet)
  @JoinColumn()
  wallet: Wallet;

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  async verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  @BeforeInsert()
  async encryptPassword() {
    this.password = await this.hashPassword(this.password);
    this.firstname = capitalize(this.firstname.trim());
    this.lastname = capitalize(this.lastname.trim());
  }
}
