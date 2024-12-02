/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Inject } from '@nestjs/common';
import { winstonLog } from 'src/config/winstonLog';
import { Sequelize } from 'sequelize-typescript';
import { KafkaDto } from './dto/kafka.dto';
import { DATABASE_CONNECTION } from '../../config/constants';
import { AmlService } from './aml.service';
import 'dotenv/config';
import * as crypto from 'crypto';
import { decrypt } from '@helpers/cipher';

const IS_CRD_PLAIN = process.env.IS_CRD_PLAIN == 'true' ? true : false
const AUTH_MODULE = IS_CRD_PLAIN ? process.env.AUTH_MODULE : decrypt(process.env.AUTH_MODULE)

@Injectable()
export class OffnetprocessService {
  constructor(
    private readonly amlService: AmlService,
    @Inject(DATABASE_CONNECTION) private DB: Sequelize,
  ) {}
  private readonly secret = AUTH_MODULE;

  async ProcessPayment(
    Transaction_Id: string,
    createPaymentDto: KafkaDto,
    Flag: string,
    refId
  ) {
    //CHecking AML
    const OTP = this.encryptPassword(createPaymentDto.OTP);
    const AML = await this.amlService.AmlCheck(
      createPaymentDto.Source_Wallet_ID,
      createPaymentDto.Dest_Wallet_ID,
      createPaymentDto.Keyword,
      createPaymentDto.Amount,
      refId,
      Transaction_Id
    );

    //IF AML OK
    if (AML.Code == 100) {
      winstonLog.log('info', 'AMLCHECK:%s', AML.Msg);

      switch (Flag) {
        case 'offnet':
          const direct = JSON.parse(
            JSON.stringify(
              await this.DB.query(
                `EXEC SW_PROC_SEND_TRANSACTION @Transaction_ID=${Transaction_Id},@Flag=${Flag},@Source_Wallet_ID=${createPaymentDto.Source_Wallet_ID},@Dest_Wallet_ID=${createPaymentDto.Dest_Wallet_ID},@Amount=${createPaymentDto.Amount},@Keyword=${createPaymentDto.Keyword},@Transaction_Fee=${createPaymentDto.Transaction_Fee},@Transaction_Comm=${createPaymentDto.Transaction_Comm},@Reference_ID='${createPaymentDto.Reference_ID}',@Charge_Payer= ${createPaymentDto.Charge_Payer} , @Currency = ${createPaymentDto.Currency} , @OffNetPIN = '${OTP}', @Comission_Receiver = ${createPaymentDto.Comission_Receiver}`,
              ),
            ),
          );
          winstonLog.log('debug', 'TRANSACTION RESULT: %s', direct[0][0]);
          if (direct[0][0].ResponseCode == 106) {
          } else {
          }

          return direct[0][0];
      }
    } else {
      //IF AML LIMITED FAILS
      winstonLog.log('info', 'RESPONSE:%s', AML.Msg);

      return {
        TransactionId: Transaction_Id,
        ResponseCode: 999,
        ResponseDescription: AML.Msg,
      };
    }
  }
  encryptPassword(password: string): string {
    const hash = crypto
      .createHmac('sha256', this.secret)
      .update(password)
      .digest('hex');

    return hash;
  }
}
