import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { CreatePinDto } from './dto/create-pin.dto';
import { random } from 'lodash';
import { VerifiyAccountDto } from './dto/verifiy-account.dto';
import { ResetPinDto } from './dto/reset-pin.dto';
import { StripeService } from 'src/stripe/stripe.service';

export type ReqUser = {
  user: { id: string; roles: Role[] };
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly stripeService: StripeService,
  ) {}

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;

    const user = await this.validateCredentials(email, password);

    const payload = { roles: user.roles, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.roles,
      is_verified: user.is_verified,
      has_pin: user.has_pin,
    };
  }

  async signup(signupDto: SignupDto) {
    const { email, firstname, lastname, password } = signupDto;

    const existingUser = await this.findByEmail(email);

    if (existingUser) throw new BadRequestException('user already exists');

    const user = this.userRepository.create({
      email,
      password,
      firstname,
      lastname,
    });

    await this.userRepository.save(user);

    await this.stripeService.createCustomer(user.id);

    const payload = { roles: user.roles, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.roles,
    };
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user && (await user.verifyPassword(password, user.password))) {
      const { id, roles } = user;

      return { id, roles, is_verified: user.is_verified, has_pin: !!user.pin };
    } else {
      throw new BadRequestException('invalid credentials');
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.findOne(id);

    const { current_password, new_password } = changePasswordDto;

    if (!(await user.verifyPassword(current_password, user.password)))
      throw new BadRequestException('invalid current password');

    const hash = await user.hashPassword(new_password);

    user.password = hash;
    user.password_changed_at = new Date();

    await this.userRepository.save(user);

    return { message: 'password changed successfully' };
  }

  async createPin(id: string, createPinDto: CreatePinDto) {
    const user = await this.findOne(id);

    user.pin = await user.hashPassword(createPinDto.pin);

    await this.userRepository.save(user);

    return { message: 'pin created successfully' };
  }

  async verifyPin(id: string, verifyPinDto: CreatePinDto) {
    const user = await this.findOne(id);

    if (!(await user.verifyPassword(verifyPinDto.pin, user.pin))) {
      throw new BadRequestException('invalid security pin!');
    }

    return { message: 'security pin verified successfully' };
  }

  async changeSecurityPin(id: string, resetPinDto: ResetPinDto) {
    const user = await this.findOne(id);

    if (!(await user.verifyPassword(resetPinDto.current_pin, user.pin))) {
      throw new BadRequestException('invalid current security pin!');
    }

    user.pin = await user.hashPassword(resetPinDto.pin);

    await this.userRepository.save(user);

    return { message: 'security pin changed successfully' };
  }

  async accountVerification(id: string) {
    const user = await this.findOne(id);

    if (user.is_verified)
      throw new BadRequestException('your account is already verified');

    const randomNumber = random(100000, 999999);

    user.verification_code = await user.hashPassword(randomNumber.toString());

    await this.userRepository.save(user);

    // todo => send unencrypted number to user's email

    console.log(randomNumber);

    return {
      message: 'verification code sent to your email',
    };
  }

  async handleAccountVerification(
    id: string,
    verifyAccountDto: VerifiyAccountDto,
  ) {
    const user = await this.findOne(id);

    if (
      !(await user.verifyPassword(
        verifyAccountDto.code.toString(),
        user.verification_code,
      ))
    ) {
      throw new BadRequestException('invalid code');
    }

    user.is_verified = true;

    await this.userRepository.save(user);

    return { message: 'account verified successfully' };
  }
}
