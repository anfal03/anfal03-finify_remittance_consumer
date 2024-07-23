import { Module } from '@nestjs/common';
import { CustomLogger } from './logger.service';
import { sequelizeConfig } from 'src/config/sequelize.config';
import { SequelizeModule } from '@nestjs/sequelize';

import { LoggerProviders } from './logger.providers';
import { AgentModule } from 'src/modules/agent/agent.module';

@Module({
  imports: [AgentModule],
  providers: [...LoggerProviders, CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
