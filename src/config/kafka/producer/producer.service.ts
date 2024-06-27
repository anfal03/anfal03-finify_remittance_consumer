import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { winstonLog } from '../../../config/winstonLog';
/*
publish meesaage / write message in a topic..

ref : https://blog.logrocket.com/microservices-nestjs-kafka-typescript/

this.paymentClient.emit('process_payment', JSON.stringify(makePaymentDto)) => do not wait for response..

this.authClient
      .send('get_user', JSON.stringify({ userId }))
      .subscribe((user: User) => {
        console.log(
          `process payment for user ${user.name} - amount: ${amount}`
        );
    })

    => it will wait for response from another micro service where have get_user

*/
@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
  async onModuleInit() {
    await this.producer.connect();
    
  }

  private readonly kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKERS],
    clientId: 'rilac_campaign_producer',
  });

  private readonly producer: Producer = this.kafka.producer();

  async produce(record: ProducerRecord) {
    const kafkaResponse = await this.producer.send(record);
    winstonLog.log(
      'info',
      'Kafka Producer Response %o',
      kafkaResponse[0].errorCode,
      {
      label: 'kafka-producer',
    });
    return kafkaResponse[0].errorCode;
  }
}
