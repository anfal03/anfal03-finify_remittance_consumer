import { Injectable, Inject } from '@nestjs/common';
import 'dotenv/config';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../../config/constants';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { winstonLog } from '../../config/winstonLog';
import { decrypt } from '@helpers/cipher';

const IS_CRD_PLAIN = process.env.IS_CRD_PLAIN == 'true' ? true : false
const AUTH_MODULE = IS_CRD_PLAIN ? process.env.AUTH_MODULE : decrypt(process.env.AUTH_MODULE)
@Injectable()
export class PasswordService {
  constructor(@Inject(DATABASE_CONNECTION) private DB: Sequelize) {}
  private readonly secret = AUTH_MODULE;

  encryptPassword(password: string, MSISDN: string): string {
    const hash = crypto
      .createHmac('sha256', this.secret)
      .update(password)
      .digest('hex');
    const walletinfo = JSON.parse(
      JSON.stringify(
        this.DB.query(
          `Exec dbo.WalletPinDetail @Msisdn = ${MSISDN}, @Flag = 'UpdateWalletPin',@New_Pin = '${hash}' `,
        ),
      ),
    );
    console.log(walletinfo);

    return hash;
  }
  async PINVerify(PIN: string, MSISDN: string) {
    const walletinfo = JSON.parse(
      JSON.stringify(
        await this.DB.query(
          `Exec dbo.WalletPinDetail @Msisdn = ${MSISDN}, @Flag = 'CheckWalletPin'`,
        ),
      ),
    );
    let match = false;
    winstonLog.log(
      'debug',
      'OUTPUT WALLET INFO STORE PROCEDURE: %s',
      walletinfo[0][0],
    );
    if (walletinfo[0][0].PIN == null || walletinfo[0][0].Failed_Attempt > 2) {
      match = false;
    } else {
      winstonLog.log('info', 'CHECKING PASSWORD');
      match = await this.verifyPassword(PIN, walletinfo[0][0].PIN, MSISDN);
    }

    const result = {
      Passwordmatch: match,
      AccountStatus: +walletinfo[0][0].AccountStatus,
    };

    winstonLog.log('info', 'PASSWORD VERIFICATION RESULT %s', result, {
      lable: 'JSONRX_PINVARIFICATION',
    });
    return result;
  }
  verifyPassword(
    password: string,
    hashedPassword: string,
    MSISDN: string,
  ): boolean {
    const hash = crypto
      .createHmac('sha256', this.secret)
      .update(password)
      .digest('hex');
    const result = hash === hashedPassword;
    if (result === false) {
      const walletinfo = JSON.parse(
        JSON.stringify(
          this.DB.query(
            `Exec dbo.WalletPinDetail @Msisdn = ${MSISDN}, @Flag = 'FailedWalletPin'`,
          ),
        ),
      );
      console.log(walletinfo);
    }

    return result;
  }
}
