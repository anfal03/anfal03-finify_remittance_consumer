import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import {
  CreateAgentDto,
  OffnetWithdrawalDto,
  SendUSSDDto,
} from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AuthmodeAuthGuard } from '../auth/authmode-auth.guard';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
  EventPattern,
} from '@nestjs/microservices';
import { winstonLog } from 'src/config/winstonLog';
import { KafkaDto } from './dto/kafka.dto';
import { Consumer, KafkaClient } from 'kafka-node';
import { Kafka } from 'kafkajs';
import { Cron, CronExpression } from '@nestjs/schedule';
@Controller('transfer')
export class AgentController {

  private kafka: Kafka;
  private consumer: any;

  constructor(private readonly agentbankingService: AgentService) {
    this.kafka = new Kafka({
      clientId: 'my-kafka-app',
      brokers: [process.env.KAFKA_BROKERS],
    });

    this.consumer = this.kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });
  }

  // @Post('/deposit')
  // deposit(@Body() createAgentbankingDto: CreateAgentDto) {
  //   return this.agentbankingService.create(createAgentbankingDto);
  // }
  // @Post('/withdraw')
  // withdraw(@Body() createAgentbankingDto: CreateAgentDto) {
  //   return this.agentbankingService.create(createAgentbankingDto);
  // }
  // @Post('/billpay')
  // billpay(@Body() createAgentbankingDto: CreateAgentDto) {
  //   return this.agentbankingService.create(createAgentbankingDto);
  // }
  // @Post('/offnetwithdraw')
  // offnet(@Body() offnetWithdrawakDto: OffnetWithdrawalDto) {
  //   return this.agentbankingService.create(offnetWithdrawakDto);
  // }
  // @Post('/offnetwithdrawwithregistration')
  // offnetregistration(@Body() createAgentbankingDto: CreateAgentDto) {
  //   return this.agentbankingService.create(createAgentbankingDto);


  // @MessagePattern('payment.req')
  // async readMessage(message: Record<string, any>): Promise<void>{
  //   const kafkdto: KafkaDto = Object.assign(new KafkaDto(), message);
  //   winstonLog.log('info', 'REQUEST: %s', JSON.stringify(message));
  //   this.agentbankingService.transactionService(kafkdto);
  // }
 // @EventPattern('payment.req')
  async readMessage(
    @Payload() payload: any,
    @Ctx() context: KafkaContext,
  ): Promise<void> {

    const income = context.getMessage();

    const kafkdto: KafkaDto = Object.assign(new KafkaDto(), income.value);
    winstonLog.log('info', 'REQUEST: %s', JSON.stringify(kafkdto));
      this.agentbankingService.transactionService(kafkdto);

    


  //  this.agentbankingService.transactionService(kafkdto);
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: process.env.KAFKA_REQ_TOPIC , fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // Your message handling logic here

        // console.log({ topic, partition, message });

    

        console.log(`topic : ${topic}`);
        console.log(`partition : ${partition}`);
        console.log(`message : `);
        const buf = JSON.parse(message.value);
        console.log(buf);


    const kafkdto: KafkaDto = Object.assign(new KafkaDto(), buf);
    winstonLog.log('info', 'REQUEST: %s', JSON.stringify(kafkdto));
    this.agentbankingService.transactionService(kafkdto);
        

        // console.log(`message json : ${JSON.stringify(message.value)}`);

        
      },
    });
  }

    @Cron(process.env.KAFKA_CONSUMER_PAUSE_TIME)
    async pauseConsumer(@Payload() data: any): Promise<void> {

      winstonLog.log('info', 'pausing topic: %s', process.env.KAFKA_REQ_TOPIC );

      await this.consumer.pause([{ topic: process.env.KAFKA_REQ_TOPIC }]);

      await this.agentbankingService.callDailyBalanceSheetProcedure()

    }

    @Cron(process.env.KAFKA_CONSUMER_RESUME_TIME)
    async resumeConsumer(@Payload() data: any): Promise<void> {

      winstonLog.log('info', 'resuming topic: %s', process.env.KAFKA_REQ_TOPIC );

      await this.consumer.resume([{ topic: process.env.KAFKA_REQ_TOPIC }]);
    }


}
