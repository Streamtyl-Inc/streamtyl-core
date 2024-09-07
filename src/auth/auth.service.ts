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

export type ReqUser = {
  user: { id: string; roles: Role[] };
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;

    const user = await this.validateCredentials(email, password);

    const payload = { roles: user.roles, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.roles,
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

      return { id, roles };
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
}
