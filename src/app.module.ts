
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './modules/agent/agent.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './common/logger/logger.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { interceptorProviders } from './helpers/interceptor';
import { DatabaseModule } from './config/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './config/kafka/kafka.module';
@Module({
  imports: [
    AgentModule,
    AuthModule,
    LoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule,],
  controllers: [AppController],
  providers: [AppService, ...interceptorProviders],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

