import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { assign } from 'lodash';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { WalletService } from 'src/wallet/wallet.service';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet.dto';
import { UpdateWalletDto } from 'src/wallet/dto/update-wallet.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly walletService: WalletService,
  ) {}

  async getProfile(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('profile not found');

    delete user.password;
    delete user.password_changed_at;
    delete user.password_reset_token;
    delete user.password_reset_token_expires;

    return user;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findOne(id);

    assign(user, updateProfileDto);

    await this.userRepository.save(user);

    delete user.password;
    delete user.password_changed_at;
    delete user.password_reset_token;
    delete user.password_reset_token_expires;

    return user;
  }

  async createWallet(userId: string, createWalletDto: CreateWalletDto) {
    const user = await this.findOne(userId);

    const wallet = await this.walletService.create(createWalletDto);

    user.wallet = wallet;

    await this.userRepository.save(user);

    return wallet;
  }

  async updateWallet(updateWalletDto: UpdateWalletDto) {
    return await this.walletService.update(
      updateWalletDto.wallet_id,
      updateWalletDto,
    );
  }

  async getWallet(userId: string) {
    const user = await this.findOne(userId);

    if (!user.wallet) throw new NotFoundException('wallet not found');

    return user.wallet;
  }
}
