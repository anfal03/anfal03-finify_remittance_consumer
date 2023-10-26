import { ClientKafka } from '@nestjs/microservices';
import { winstonLog } from '../../config/winstonLog';
import { Injectable, Inject } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BonuseService {
  constructor(
    @Inject('kafka_module')
    private readonly client: ClientKafka,
  ) {}
  //KAFKA
  async onModuleInit() {
    [process.env.KAFKA_REQ_TOPIC].forEach((key) =>
      this.client.subscribeToResponseOf(`${key}`),
    );
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.close();
  }
  async bonus(TransactionId: string, createPaymentDto: CreatePaymentDto) {
    const request = {
      TransactionId: createPaymentDto.TransactionId,
      Msisdn: createPaymentDto.Source_Wallet_ID,
      MerchantCode: createPaymentDto.Dest_Wallet_ID,
      Amount: createPaymentDto.Amount,
      Keyword: createPaymentDto.Keyword,
    };
    winstonLog.log('debug', 'RILAC: %s', JSON.stringify(request));
    const kafkaresponse = this.client.emit(
      process.env.KAFKA_COMMISSION_TOPIC,
      JSON.stringify(request),
    );

  }
}
