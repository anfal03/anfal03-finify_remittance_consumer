import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopic,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';
import { firstValueFrom } from 'rxjs';

/*
read message from a topic..

ref : https://blog.logrocket.com/microservices-nestjs-kafka-typescript/

if producer publish event via emit then consumer will receive via @EventPattern('process_payment')

if producer publish event via send with subscribeToResponseOf then consumer will receive via @MessagePattern('get_user')
*/
@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }

  private readonly kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKERS],
  });

  private readonly consumers: Consumer[] = [];

  async consume(groupId: string, topic: string, config: ConsumerRunConfig) {
    const cosumer: Consumer = this.kafka.consumer({ groupId: groupId });
    await cosumer.connect().catch((e) => console.error(e));
    await cosumer.subscribe({ topic: topic, fromBeginning: true });
    await cosumer.run(config);
    this.consumers.push(cosumer);
  }
}
