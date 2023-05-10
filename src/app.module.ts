import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './modules/agent/agent.module';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [AgentModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
