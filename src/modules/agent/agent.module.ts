import { Module, Logger } from '@nestjs/common';
import { AgentService } from './agent.service';
import { DatabaseModule } from '../../config/database/database.module';
import { AgentController } from './agent.controller';
import { PasswordService } from './password.service';
import { ThirdpartyapiService } from './thirdpartyapi.service';
import { AmlService } from './aml.service';
import { userProviders } from './agent.providers';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
@Module({
  controllers: [AgentController],
  providers: [
    AgentService,
    AmlService,
    PasswordService,
    ThirdpartyapiService,
    ...userProviders,
    Logger,
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
        },
      },
    ]),
  ],
  exports: [ThirdpartyapiService, AmlService, PasswordService, AgentService],
})
export class AgentModule {}
