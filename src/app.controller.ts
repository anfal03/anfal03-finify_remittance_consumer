import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './modules/auth/local-auth.guard';
@Controller()
export class AppController {
  @UseGuards(LocalAuthGuard)
  @Post('authentication/login')
  async login(@Request() req) {
    return req.user;
  }
}