import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { wallet } from 'src/utils/route';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller(wallet);
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.create(createWalletDto);
  }
}
