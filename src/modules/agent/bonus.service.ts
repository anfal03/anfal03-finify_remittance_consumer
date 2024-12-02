import { ClientKafka } from '@nestjs/microservices';
import { winstonLog } from '../../config/winstonLog';
import { Injectable, Inject } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { decrypt } from '@helpers/cipher';

const IS_CRD_PLAIN = process.env.IS_CRD_PLAIN == 'true' ? true : false
// const KAFKA_REQ_TOPIC = IS_CRD_PLAIN ? process.env.KAFKA_REQ_TOPIC : decrypt(process.env.KAFKA_REQ_TOPIC)
// const KAFKA_COMMISSION_TOPIC = IS_CRD_PLAIN ? process.env.KAFKA_COMMISSION_TOPIC : decrypt(process.env.KAFKA_COMMISSION_TOPIC)

const KAFKA_REQ_TOPIC = process.env.KAFKA_REQ_TOPIC
const KAFKA_COMMISSION_TOPIC = process.env.KAFKA_COMMISSION_TOPIC

@Injectable()
export class BonuseService {
  constructor(
    @Inject('kafka_module')
    private readonly client: ClientKafka,
  ) {}
  //KAFKA
  async onModuleInit() {
    [KAFKA_REQ_TOPIC].forEach((key) =>
      this.client.subscribeToResponseOf(`${key}`),
    );
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.close();
  }
  async bonus(TransactionId: string, createPaymentDto: CreatePaymentDto,refId) {
    const request = {
      TransactionId: createPaymentDto.TransactionId,
      Msisdn: createPaymentDto.Source_Wallet_ID,
      MerchantCode: createPaymentDto.Dest_Wallet_ID,
      Amount: createPaymentDto.Amount,
      Keyword: createPaymentDto.Keyword,
    };

    winstonLog.log(
      'info',
      'Messeage Send for RILAC bonus to topic -> %s, message -> %s',
      KAFKA_COMMISSION_TOPIC,
      JSON.stringify(request),
      { transactionid_for_log: refId, 
        source: createPaymentDto.Source_Wallet_ID,
        dest: createPaymentDto.Dest_Wallet_ID,
        transaction_id: createPaymentDto.TransactionId },
    );

    const kafkaresponse = this.client.emit(
      KAFKA_COMMISSION_TOPIC,
      JSON.stringify(request),
    );


  }
}
