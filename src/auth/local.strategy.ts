import {
  Dependencies,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
@Dependencies(AuthService)
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
    this.authService = authService;
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateCredentials(email, password);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    return user;
  }
}
