import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ReqUser } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { user } from 'src/utils/route';
import { MakeAdminDto } from './dto/make-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserBankInfoDto } from './dto/create-user-bank-info.dto';
import { UpdateUserBankInfoDto } from './dto/update-user-bank-info.dto';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

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

  @Patch('/admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async makeAdmin(@Body() makeAdminDto: MakeAdminDto) {
    return await this.userService.makeAdmin(makeAdminDto);
  }

  @Patch('/manager')
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER)
  async makeManager(@Body() makeAdminDto: MakeAdminDto) {
    return await this.userService.makeManager(makeAdminDto);
  }

  @Get('/identity')
  async getUserIdentity(@Req() req: Request & ReqUser) {
    return await this.userService.getUserIdentity(req.user.id);
  }

  @Get('/bank-info')
  async getBankInfo(
    @Req() req: Request & ReqUser,
    @Paginate() query: PaginateQuery,
  ) {
    return await this.userService.getUserBanksInfo(req.user.id, query);
  }

  @Post('/bank-info')
  async createBankInfo(
    @Req() req: Request & ReqUser,
    @Body() createUserBankInfoDto: CreateUserBankInfoDto,
  ) {
    return await this.userService.createUserBankInfo(
      req.user.id,
      createUserBankInfoDto,
    );
  }

  @Patch('/bank-info/:id')
  async updateBankInfo(
    @Param('id') id: string,
    @Body() updateUserBankInfoDto: UpdateUserBankInfoDto,
  ) {
    return await this.userService.updateUserBankInfo(id, updateUserBankInfoDto);
  }

  @Get('/order')
  async getUserOrders(
    @Paginate() query: PaginateQuery,
    @Req() req: Request & ReqUser,
  ) {
    return await this.userService.getUserOrders(req.user.id, query);
  }
}
