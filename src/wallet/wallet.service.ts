import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async create(createWalletDto: CreateWalletDto) {
    const wallet = this.walletRepository.create(createWalletDto);

    await this.walletRepository.save(wallet);

    return wallet;
  }

  async findOne(id: string) {
    const wallet = await this.walletRepository.findOneBy({ id });

    if (!wallet) throw new NotFoundException('wallet not found');

    return wallet;
  }

  async update(id: string, updateWalletDto: UpdateWalletDto) {
    const wallet = await this.findOne(id);

    wallet.wallet_address = updateWalletDto.wallet_address;

    await this.walletRepository.save(wallet);

    return wallet;
  }
}
