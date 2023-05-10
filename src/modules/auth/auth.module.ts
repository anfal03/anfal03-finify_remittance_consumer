import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../config/database/database.module';
import { authProviders } from './auth.providers';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';

import 'dotenv/config';
@Module({
  providers: [AuthService, ...authProviders, LocalStrategy, JwtStrategy],
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWTKEY,
      signOptions: { expiresIn: '120s' },
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
