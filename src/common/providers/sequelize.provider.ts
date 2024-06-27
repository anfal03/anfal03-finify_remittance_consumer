import { Sequelize } from 'sequelize-typescript';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { sequelizeConfig } from '../../config/sequelize.config';

@Injectable()
export class SequelizeProvider extends Sequelize implements OnModuleInit {
  constructor(private readonly customLogger: CustomLogger) {
    super({
      ...sequelizeConfig,
      logging: (msg) => customLogger.debug(msg),
    });
  }

  async onModuleInit() {
    await this.sync();
  }
}
