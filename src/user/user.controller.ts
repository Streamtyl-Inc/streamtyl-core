import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ReqUser } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { user } from 'src/utils/route';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet.dto';

@Controller(user)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  async getProfile(@Req() req: Request & ReqUser) {
    return await this.userService.getProfile(req.user.id);
  }

  @Patch('/profile')
  async updateProfile(
    @Req() req: Request & ReqUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return await this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('/wallet')
  async create(
    @Body() createWalletDto: CreateWalletDto,
    @Req() req: Request & ReqUser,
  ) {
    return await this.userService.createWallet(req.user.id, createWalletDto);
  }
}
