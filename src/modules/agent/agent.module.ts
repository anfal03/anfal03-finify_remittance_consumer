import { Module, Logger } from '@nestjs/common';
import { AgentService } from './agent.service';
import { DatabaseModule } from '../../config/database/database.module';
import { AgentController } from './agent.controller';
import { PasswordService } from './password.service';
import { ThirdpartyapiService } from './thirdpartyapi.service';
import { AmlService } from './aml.service';
import { userProviders } from './agent.providers';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { AgentbankingService } from './agentbanking.service';
import { OffnetprocessService } from './offnetprocess.service';
import { OffnetCashOutService } from './offnetcashout.service';
import { PaymentService } from './payment.service';
import { BonuseService } from './bonus.service';
import { PaymentApiCallService } from './paymentapicall.service';

@Module({
  controllers: [AgentController],
  providers: [
    AgentService,
    AmlService,
    PasswordService,
    ThirdpartyapiService,
    AgentbankingService,
    OffnetprocessService,
    OffnetCashOutService,
    BonuseService,
    PaymentService,
    PaymentApiCallService,
    ...userProviders,
    Logger
  ],
  imports: [
    DatabaseModule,
    HttpModule,
    ClientsModule.register([
      {
        name: 'kafka_module',
        transport: Transport.KAFKA,
        options: {
          client: {
            // clientId: 'kafka_client',
            // ssl: true,
            brokers: [process.env.KAFKA_BROKERS],
          },
          consumer: {
            groupId: process.env.KAFKA_GROUP_ID,
            allowAutoTopicCreation: true,
          },
          run: {
            autoCommit: true,
          },
        },
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  exports: [
    ThirdpartyapiService,
    AmlService,
    PasswordService,
    AgentService,
    AgentbankingService,
    OffnetprocessService,
    OffnetCashOutService,
    PaymentService,
    BonuseService,
    PaymentApiCallService,
  ],
})
export class AgentModule {}
