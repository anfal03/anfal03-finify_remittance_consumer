import { Controller } from '@nestjs/common';
import { AgentService } from './agent.service';

import { Ctx, KafkaContext, Payload } from '@nestjs/microservices';
import { LogFilter, winstonLog } from '../../config/winstonLog';
import { KafkaDto } from './dto/kafka.dto';

import { Kafka } from 'kafkajs';
import { Cron } from '@nestjs/schedule';

import { decrypt } from '@helpers/cipher';

const IS_CRD_PLAIN = process.env.IS_CRD_PLAIN == 'true' ? true : false
// const KAFKA_BROKERS = IS_CRD_PLAIN ? process.env.KAFKA_BROKERS : decrypt(process.env.KAFKA_BROKERS)
// const KAFKA_GROUP_ID = IS_CRD_PLAIN ? process.env.KAFKA_GROUP_ID : decrypt(process.env.KAFKA_GROUP_ID)
// const KAFKA_MAIN_TOPIC = IS_CRD_PLAIN ? process.env.KAFKA_MAIN_TOPIC : decrypt(process.env.KAFKA_MAIN_TOPIC)

const KAFKA_BROKERS = process.env.KAFKA_BROKERS 
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID 
const KAFKA_MAIN_TOPIC = process.env.KAFKA_MAIN_TOPIC 
@Controller('transfer')
export class AgentController {
  private kafka: Kafka;
  private consumer: any;

  constructor(private readonly agentbankingService: AgentService) {
    this.kafka = new Kafka({
      clientId: 'my-kafka-app',
      brokers: [KAFKA_BROKERS],
    });

    this.consumer = this.kafka.consumer({
      groupId: KAFKA_GROUP_ID,
    });
  }


  async readMessage(
    @Payload() payload: any,
    @Ctx() context: KafkaContext,

  ): Promise<void> {
    const income = context.getMessage();

    const kafkdto: KafkaDto = Object.assign(new KafkaDto(), income.value);
    winstonLog.log('info', 'REQUEST: %o', LogFilter(kafkdto));
    this.agentbankingService.transactionService(kafkdto);

    //  this.agentbankingService.transactionService(kafkdto);
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: KAFKA_MAIN_TOPIC,
      fromBeginning: true,
    });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // Your message handling logic here

        // console.log({ topic, partition, message });

        let source = null
        let dest = null
        let transactionid = null
        console.log(`topic : ${topic}`, );
        console.log(`partition : ${partition}`);
        console.log(`message : `);
        const buf = JSON.parse(message.value);
        console.log(buf);

        const kafkdto: KafkaDto = Object.assign(new KafkaDto(), buf);
        source = kafkdto.Source_Wallet_ID
        dest = kafkdto.Dest_Wallet_ID
        transactionid = kafkdto.TransactionId
                // console.log({ topic, partition, message });

        winstonLog.log('info', `topic: ${topic} , partition: ${partition} , message: ${message}`,
          { transactionid_for_log: kafkdto.refId, 
            source: source,
            dest: dest,
            transaction_id: transactionid }
        );
        winstonLog.log('info', 'REQUEST: %o', LogFilter(kafkdto),
        { transactionid_for_log: kafkdto.refId, 
          source: source,
          dest: dest,
          transaction_id: transactionid });
        await this.consumer.commitOffsets([
          {
            topic,
            partition,
            offset: message.offset + 1,
          },
        ]);
        this.agentbankingService.transactionService(kafkdto);

        // console.log(`message json : ${JSON.stringify(message.value)}`);
      },
    });
  }

  // @Cron(process.env.KAFKA_CONSUMER_PAUSE_TIME)
  // async pauseConsumer(@Payload() data: any): Promise<void> {
  //   winstonLog.log('info', 'pausing topic: %s', process.env.KAFKA_REQ_TOPIC);

  //   await this.consumer.pause([{ topic: process.env.KAFKA_REQ_TOPIC }]);

  //   await this.agentbankingService.callDailyBalanceSheetProcedure();
  // }

  // @Cron(process.env.KAFKA_CONSUMER_RESUME_TIME)
  // async resumeConsumer(@Payload() data: any): Promise<void> {
  //   winstonLog.log('info', 'resuming topic: %s', process.env.KAFKA_REQ_TOPIC);

  //   await this.consumer.resume([{ topic: process.env.KAFKA_REQ_TOPIC }]);
  // }
}
