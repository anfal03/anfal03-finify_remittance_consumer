import { Injectable, Inject } from '@nestjs/common';
import {
  AmlCheckDto,
  CreateAgentDto,
  OffnetWithdrawalDto,
  SendUSSDDto,
} from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { ClientKafka } from '@nestjs/microservices';
import { AgentPorfileModel, JsonrxModel, AgentModel } from '../../models';
import {
  DATABASE_CONNECTION,
  AGENTPROFILE_REPOSITORY,
  TRANSACTION_REPOSITORY,
  JSONRX_REPOSITORY,
} from '../../config/constants';
import { Sequelize } from 'sequelize-typescript';
import { PasswordService } from './password.service';
import { ThirdpartyapiService } from './thirdpartyapi.service';

import { winstonLog } from 'src/config/winstonLog';
import { KafkaDto } from './dto/kafka.dto';
@Injectable()
export class AgentService {
  constructor(
    @Inject(AGENTPROFILE_REPOSITORY)
    private readonly agentprofileRepository: typeof AgentPorfileModel,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: typeof AgentModel,
    @Inject(JSONRX_REPOSITORY)
    private readonly jsonrxRepository: typeof JsonrxModel,
    @Inject(DATABASE_CONNECTION) private DB: Sequelize,
    @Inject('kafka_module') // Receiving kafka client from Module to connect with Kafka service bus
    private readonly client: ClientKafka,
    private readonly passwordService: PasswordService,
    private readonly thirdpartyService: ThirdpartyapiService,
  ) {}
  //KAFKA CONNECT
  async onModuleInit() {
    [process.env.KAFKA_REQ_TOPIC].forEach((key) =>
      this.client.subscribeToResponseOf(`${key}`),
    );
    await this.client.connect();
  }
  async onModuleDestroy() {
    await this.client.close();
  }
  // Generate Transaction ID
  async genTransectionId() {
    const curentDateTime = new Date();
    const year = curentDateTime.getFullYear().toString().substr(-2);
    const month = (curentDateTime.getMonth() + 1).toString().padStart(2, '0');
    const date = curentDateTime.getDate().toString().padStart(2, '0');
    const hour = curentDateTime.getHours().toString().padStart(2, '0');
    const minit = curentDateTime.getMinutes().toString().padStart(2, '0');
    const seconds = curentDateTime.getSeconds().toString().padStart(2, '0');
    const milliseconds = curentDateTime
      .getMilliseconds()
      .toString()
      .padStart(3, '0');

    const transectionId = `${year}${month}${date}${hour}${minit}${seconds}${milliseconds}`;
    return transectionId;
  }


  async transactionService(kafkadto: KafkaDto) {
    winstonLog.log('info', 'KAFKABODY: %s', JSON.stringify(kafkadto));
    if (kafkadto.Keyword === process.env.OFFNET_KEY) {
      const callingpaymentprocessor =
        await this.thirdpartyService.OffnetProcess(kafkadto);
      winstonLog.log(
        'debug',
        'CALLED OFFNET %s',
        JSON.stringify(callingpaymentprocessor),
      );
      const kafkaresponse = this.client.emit(
        process.env.KAFKA_NOTIFICATION_TOPIC,
        JSON.stringify(callingpaymentprocessor),
      );
      winstonLog.log('info', 'KAFKARESPONSE:%s', JSON.stringify(kafkaresponse));
    } else if (kafkadto.Keyword === process.env.OFFNET_CASHOUT) {
      const callingpaymentprocessor =
        await this.thirdpartyService.OffnetCashoutProcess(kafkadto);
      winstonLog.log(
        'debug',
        'CALLED OFFNET cashout  %s',
        JSON.stringify(callingpaymentprocessor),
      );
      const kafkaresponse = this.client.emit(
        process.env.KAFKA_NOTIFICATION_TOPIC,
        JSON.stringify(callingpaymentprocessor),
      );
    } else {
      const callingpaymentprocessor =
        this.thirdpartyService.GetAmlConfirmResponse(kafkadto);
      winstonLog.log(
        'debug',
        'TRANSACTION PROCESS %s',
        JSON.stringify(callingpaymentprocessor),
      );
    }
  }
  // async sendService(sendUSSDDto: SendUSSDDto) {
  //   const checkpin = await this.passwordService.PINVerify(
  //     sendUSSDDto.PIN,
  //     sendUSSDDto.SOURCEMSISDN,
  //   );
  //   if (checkpin.Passwordmatch == true && checkpin.AccountStatus == 0) {
  //     const TransactionId = await this.genTransectionId();
  //     const amlcheck: AmlCheckDto = {
  //       Keyword: sendUSSDDto.KEYWORD,
  //       Msisdn: sendUSSDDto.SOURCEMSISDN,
  //       DestinationMsisdn: sendUSSDDto.DESTMSISDN,
  //       Currency: `'${process.env.CURRENCY}'`,
  //       Pin: sendUSSDDto.PIN,
  //       Amount: sendUSSDDto.AMOUNT,
  //       ReferenceId: '',
  //       LANG: sendUSSDDto.LANG,
  //     };
  //     const payload = await this.thirdpartyService.GetAmlConfirmResponse(
  //       amlcheck,
  //     );
  //     winstonLog.log('info', 'AMLCHECK RESULT: %s', payload);
  //     const kafkaresponse = this.client.emit(
  //       process.env.KAFKA_REQ_TOPIC,
  //       JSON.stringify(payload),
  //     );
  //     winstonLog.log('info', 'KAFKARESPONSE:%s', JSON.stringify(kafkaresponse));
  //     if (payload.ResponseCode == 100) {
  //       if (sendUSSDDto.LANG === 'EN')
  //         return {
  //           TransactionId: payload.TransactionId,
  //           ResponseCode: payload.ResponseCode,
  //           ResponseDescription: process.env.SUCCESS_ENG,
  //         };
  //       else
  //         return {
  //           TransactionId: payload.TransactionId,
  //           ResponseCode: payload.ResponseCode,
  //           ResponseDescription: process.env.SUCCESS_LOCAL,
  //         };
  //     } else {
  //       if (sendUSSDDto.LANG === 'EN')
  //         return {
  //           TransactionId: payload.TransactionId,
  //           ResponseCode: payload.ResponseCode,
  //           ResponseDescription: process.env.FAIL_ENG,
  //         };
  //       else
  //         return {
  //           TransactionId: payload.TransactionId,
  //           ResponseCode: payload.ResponseCode,
  //           ResponseDescription: process.env.FAIL_LOCAL,
  //         };
  //     }
  //   } else if (checkpin.AccountStatus != 0) {
  //     if (sendUSSDDto.LANG === 'EN')
  //       return {
  //         ResponseCode: 999,
  //         ResponseDescription: process.env.ACCOUNTLOCK_ENG,
  //         TransactionId: 0,
  //       };
  //     else
  //       return {
  //         ResponseCode: 999,
  //         ResponseDescription: process.env.ACCOUNTLOCK_LOCAL,
  //         TransactionId: 0,
  //       };
  //   } else {
  //     if (sendUSSDDto.LANG === 'EN')
  //       return {
  //         ResponseCode: 999,
  //         ResponseDescription: process.env.WRONGPIN_ENG,
  //         TransactionId: 0,
  //       };
  //     else
  //       return {
  //         ResponseCode: 999,
  //         ResponseDescription: process.env.WRONGPIN_LOCAL,
  //         TransactionId: 0,
  //       };
  //   }

  //   return {
  //     ResponseCode: 999,
  //     ResponseDescription: process.env.FAIL_ENG,
  //     TransactionId: 0,
  //   };
  // }
  async offnetwithdrawal(offnetWithdrawDto: OffnetWithdrawalDto) {
    return 'offnet';
  }

  async callDailyBalanceSheetProcedure() {
    // const CurrentDate = (datetime=new Date())=>{return datetime.toISOString().split('T')[0]}

    const datetime = new Date();
    const datetime2 = new Date();

    datetime.setDate(datetime.getDate() + 1);

    const CurrentDate = datetime.toISOString().split('T')[0];
    const PastCurrentDate = datetime2.toISOString().split('T')[0];

    console.log(CurrentDate);

    const result = await this.DB.query(`select count(RowId) as rows from SW_TBL_DAILY_WALLET_STATUS where DateOf > '${PastCurrentDate}' `)


    if (result[0][0]['rows'] < 1) {
      //calling SW_JOB_PROC_DAILY_BALANCE_SHEET @EodDate = '${CurrentDate}'
      winstonLog.log('info', `calling SW_JOB_PROC_DAILY_BALANCE_SHEET for balance sheet of : '${PastCurrentDate}' `);

      const start_result = await this.DB.query(`INSERT INTO [dbo].[balancesheet_runtime] ([start_date_time],[input_date]) VALUES (getdate(),'${CurrentDate}');`)

         await this.DB.query(
        `EXEC SW_JOB_PROC_DAILY_BALANCE_SHEET @EodDate = '${CurrentDate}' `,
      );

      const end_result = await this.DB.query(`UPDATE [dbo].[balancesheet_runtime] SET [end_date_time] = getdate() WHERE ([dbo].[balancesheet_runtime].[input_date] = '${CurrentDate}')`)

    }
    

  
  }
}
