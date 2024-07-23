import { Controller } from '@nestjs/common';
import { AgentService } from './agent.service';

import { Ctx, KafkaContext, Payload } from '@nestjs/microservices';
import { winstonLog } from '../../config/winstonLog';
import { KafkaDto } from './dto/kafka.dto';

import { Kafka } from 'kafkajs';
import { Cron } from '@nestjs/schedule';
import { CustomLogger } from '../../common/logger/logger.service';
@Controller('transfer')
export class AgentController {
  private kafka: Kafka;
  private consumer: any;

  constructor(private readonly agentbankingService: AgentService, private readonly logger: CustomLogger,) {
    this.kafka = new Kafka({
      clientId: 'finify_remittance_consumer',
      brokers: [process.env.KAFKA_BROKERS],
    });

    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID,
    });
  }


  async readMessage(
    @Payload() payload: any,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const income = context.getMessage();

    const kafkdto: KafkaDto = Object.assign(new KafkaDto(), income.value);
    this.logger.log ('REQUEST:'+ JSON.stringify(kafkdto));
    this.agentbankingService.transactionService(kafkdto);

    //  this.agentbankingService.transactionService(kafkdto);
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: process.env.KAFKA_MAIN_TOPIC,
      fromBeginning: true,
    });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // Your message handling logic here

        // console.log({ topic, partition, message });

        winstonLog.log('info','topic %s:', topic);
        console.log(`partition : ${partition}`);
        console.log(`message : `);
        const buf = JSON.parse(message.value);
        console.log(buf);

        const kafkdto: KafkaDto = Object.assign(new KafkaDto(), buf);
        this.logger.log('REQUEST: %s'+ JSON.stringify(kafkdto));
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

  @Cron(process.env.KAFKA_CONSUMER_PAUSE_TIME)
  async pauseConsumer(@Payload() data: any): Promise<void> {
    winstonLog.log('info', 'pausing topic: %s', process.env.KAFKA_MAIN_TOPIC);

    await this.consumer.pause([{ topic: process.env.KAFKA_MAIN_TOPIC }]);

    await this.agentbankingService.callDailyBalanceSheetProcedure();
  }

  @Cron(process.env.KAFKA_CONSUMER_RESUME_TIME)
  async resumeConsumer(@Payload() data: any): Promise<void> {
    winstonLog.log('info', 'resuming topic: %s', process.env.KAFKA_MAIN_TOPIC);

    await this.consumer.resume([{ topic: process.env.KAFKA_MAIN_TOPIC }]);
  }
}
