import { Injectable, Inject } from '@nestjs/common';
import { JsonrxModel } from '../../models';
import { JSONRX_REPOSITORY, DATABASE_CONNECTION } from '../../config/constants';
import { Sequelize } from 'sequelize-typescript';
import { JwtService } from '@nestjs/jwt';
import { winstonLog } from '../../config/winstonLog';
@Injectable()
export class AuthService {
  constructor(
    @Inject(JSONRX_REPOSITORY)
    private readonly userRepository: typeof JsonrxModel,
    @Inject(DATABASE_CONNECTION) private DB: Sequelize,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    Msisdn: string,
    FullName: string,
    AppVersion: string,
    PhoneBrand: string,
    PhoneOs: string,
    OsVersion: string,
    authorization: string,
  ): Promise<any> {
    const obj = JSON.parse(
      JSON.stringify(
        await this.DB.query(
          `EXEC dbo.SW_PROC_VERIFY_JSONRX_REGISTRATION @FLAG = 'ValidateDevice', @Msisdn =  ${Msisdn}, @Imei ='${FullName}', @AppVersion = '${AppVersion}', @PhoneBrand= '${PhoneBrand}',@PhoneOs = '${PhoneOs}',@OsVersion = '${OsVersion}'`,
        ),
      ),
    );

    if (obj[0][0].Code == 100) {
      winstonLog.log('debug', 'Customer Validation Check: %s', obj[0]);
      let varification = Buffer.from(
        `${Msisdn}:${obj[0][0].Device_Password}`,
      ).toString('base64');
      varification = `Basic ${varification}`;
      winstonLog.log('debug', 'Varification Code: %s', varification);
      if (authorization == varification) {
        winstonLog.log('info', 'Authorized: %s', authorization);
        const payload = { username: Msisdn, sub: authorization };
        const token = this.jwtService.sign(payload);
        const update = await this.update(Msisdn, varification);
        console.log(update);
        return {
          access_token: token,
        };
      } else {
        console.log('UNAUTHORIZED');
        return null;
      }
    } else {
      console.log('User not registered');
      return null;
    }
  }
  async validatemodule(Token: string) {
    const payload = JSON.parse(
      JSON.stringify(
        this.userRepository.findOne({
          where: { ACCESS_TOKEN: Token },
        }),
      ),
    );
    if (payload[0][0].MSISDN != null) return true;
    else return false;
  }
  async update(Msisdn: string, ACCESS_TOKEN: string) {
    return this.userRepository
      .update<JsonrxModel>(
        {
          ACCESS_TOKEN: ACCESS_TOKEN,
          ACCESS_TOKEN_UPDATE:
            this.userRepository.sequelize.literal('GETDATE()'),
        },
        { where: { Msisdn: Msisdn } },
      )
      .then(() => {
        return { RESPONSECODE: '100' };
      })
      .catch((error) => {
        return { RESPONSECODE: error };
      });
  }
}
