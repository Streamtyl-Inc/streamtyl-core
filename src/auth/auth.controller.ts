import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { auth } from 'src/utils/route';
import { AuthService, ReqUser } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreatePinDto } from './dto/create-pin.dto';
import { VerifiyAccountDto } from './dto/verifiy-account.dto';
import { ResetPinDto } from './dto/reset-pin.dto';

@Controller(auth)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request & ReqUser,
  ) {
    return await this.authService.changePassword(
      req.user.id,
      changePasswordDto,
    );
  }

  @Post('/create-pin')
  @UseGuards(JwtAuthGuard)
  async createPin(
    @Body() createPinDto: CreatePinDto,
    @Req() req: Request & ReqUser,
  ) {
    return await this.authService.createPin(req.user.id, createPinDto);
  }

  @Post('/verify-pin')
  @UseGuards(JwtAuthGuard)
  async verifyPin(
    @Body() verifyPinDto: CreatePinDto,
    @Req() req: Request & ReqUser,
  ) {
    return await this.authService.verifyPin(req.user.id, verifyPinDto);
  }

  @Patch('/change-pin')
  @UseGuards(JwtAuthGuard)
  async changePin(
    @Body() resetPinDto: ResetPinDto,
    @Req() req: Request & ReqUser,
  ) {
    return await this.authService.changeSecurityPin(req.user.id, resetPinDto);
  }

  @Post('/account-verification')
  @UseGuards(JwtAuthGuard)
  async accountVerification(@Req() req: Request & ReqUser) {
    return await this.authService.accountVerification(req.user.id);
  }

  @Patch('/verify-account')
  @UseGuards(JwtAuthGuard)
  async handleAccountVerification(
    @Body() verifyAccountDto: VerifiyAccountDto,
    @Req() req: Request & ReqUser,
  ) {
    return await this.authService.handleAccountVerification(
      req.user.id,
      verifyAccountDto,
    );
  }
}
