import { IsString, IsNotEmpty } from 'class-validator';
import { BaseTable } from 'src/base/base.table';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'wallets' })
export class Wallet extends BaseTable {
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar' })
  wallet_address: string;
}
