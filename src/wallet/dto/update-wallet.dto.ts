import { PartialType } from '@nestjs/mapped-types';
import { CreateWalletDto } from './create-wallet.dto';
import { IsUUID } from 'class-validator';

export class UpdateWalletDto extends PartialType(CreateWalletDto) {
  @IsUUID()
  wallet_id: string;
}
