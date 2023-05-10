import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { winstonLog } from '../../config/winstonLog';
import { ExtractJwt } from 'passport-jwt';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'basic') {
  private readonly headerValue: string;
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const pass = password.split('|');
    winstonLog.log('info', 'USERNAME: %s', username);
    winstonLog.log('debug', 'PASSWORD: %s', password);
    winstonLog.log('debug', 'PASSWORD: %s', this.headerValue);
    const user = await this.authService.validateUser(
      username,
      pass[0],
      pass[1],
      pass[2],
      pass[3],
      pass[4],
      pass[5],
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

}
