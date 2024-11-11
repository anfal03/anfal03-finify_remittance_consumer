import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import 'dotenv/config';

import { decrypt } from '@helpers/cipher';

const IS_CRD_PLAIN = process.env.IS_CRD_PLAIN == 'true' ? true : false
const JWTKEY = IS_CRD_PLAIN ? process.env.JWTKEY : decrypt(process.env.JWTKEY)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWTKEY,
    });
    console.log(JWTKEY);
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
