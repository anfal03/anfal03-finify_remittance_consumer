import { Injectable, Inject } from '@nestjs/common';

import { KafkaDto } from './dto/kafka.dto';

import { DATABASE_CONNECTION } from '../../config/constants';
import { winstonLog } from '../../config/winstonLog';
import { Sequelize } from 'sequelize-typescript';
import { OffnetprocessService } from './offnetprocess.service';
import { OffnetCashOutService } from './offnetcashout.service';
import { Notification_Template } from './agentbanking.interface';

@Injectable()
export class AgentbankingService {
  constructor(
    private readonly offnetprocessservice: OffnetprocessService,
    private readonly offnetcashoutservice: OffnetCashOutService,
    @Inject(DATABASE_CONNECTION) private DB: Sequelize,
  ) {}
  private notification_template: Notification_Template;
  async create(createAgentbankingDto: KafkaDto) {
    const offnetcashout = await this.offnetcashoutservice.ProcessPayment(
      createAgentbankingDto,
      'Confirm',
    );
    switch (offnetcashout.Code) {
      case 104:
        this.notification_template = {
          KEYWORD: createAgentbankingDto.Keyword,
          TemplateID: '',
          LANG: createAgentbankingDto.Language,
          SourceMsisdn: createAgentbankingDto.Source_Wallet_ID,
          Amount: createAgentbankingDto.Amount,
          DestinationMsisdn: createAgentbankingDto.Dest_Wallet_ID,
          OTP: '',
          RewardPoints: '',
          REFID: '',
          Pin: '',
          TransectionId: createAgentbankingDto.TransactionId,
          Issuccess: true,
          Is_Financial: 'Y',
        };

        break;
      case 125:
        this.notification_template = {
          KEYWORD: createAgentbankingDto.Keyword,
          TemplateID: 'FAIL_TRANSACTIONID',
          LANG: createAgentbankingDto.Language,
          SourceMsisdn: createAgentbankingDto.Source_Wallet_ID,
          Amount: createAgentbankingDto.Amount,
          DestinationMsisdn: createAgentbankingDto.Dest_Wallet_ID,
          OTP: '',
          RewardPoints: '',
          REFID: '',
          Pin: '',
          TransectionId: createAgentbankingDto.TransactionId,
          Issuccess: false,
          Is_Financial: 'N',
        };
        break;

      case 126:
        this.notification_template = {
          KEYWORD: createAgentbankingDto.Keyword,
          TemplateID: 'INVALID_DESTNATION',
          LANG: createAgentbankingDto.Language,
          SourceMsisdn: createAgentbankingDto.Source_Wallet_ID,
          Amount: createAgentbankingDto.Amount,
          DestinationMsisdn: createAgentbankingDto.Dest_Wallet_ID,
          OTP: '',
          RewardPoints: '',
          REFID: '',
          Pin: '',
          TransectionId: createAgentbankingDto.TransactionId,
          Issuccess: false,
          Is_Financial: 'N',
        };
        break;

      case 999:
        this.notification_template = {
          KEYWORD: createAgentbankingDto.Keyword,
          TemplateID: 'FAIL_ALL',
          LANG: createAgentbankingDto.Language,
          SourceMsisdn: createAgentbankingDto.Source_Wallet_ID,
          Amount: createAgentbankingDto.Amount,
          DestinationMsisdn: createAgentbankingDto.Dest_Wallet_ID,
          OTP: '',
          RewardPoints: '',
          REFID: '',
          Pin: '',
          TransectionId: createAgentbankingDto.TransactionId,
          Issuccess: false,
          Is_Financial: 'N',
        };
        break;
    }
    return this.notification_template;
  }

  async offnetprocess(kafkadto: KafkaDto) {
    const TransactionEntry = await this.TransactionEntry(kafkadto);
    if (TransactionEntry.ResponseCode == 100) {
      const offnetresult = await this.offnetprocessservice.ProcessPayment(
        kafkadto.TransactionId,
        kafkadto,
        'offnet',
        kafkadto.refId
      );
      winstonLog.log(
        'debug',
        'OFFNET  PROCESS: %s',
        JSON.stringify(offnetresult),
      );
      switch (offnetresult.Code) {
        case 104:
          this.notification_template = {
            KEYWORD: kafkadto.Keyword,
            TemplateID: '',
            LANG: kafkadto.Language,
            SourceMsisdn: kafkadto.Source_Wallet_ID,
            Amount: kafkadto.Amount,
            DestinationMsisdn: kafkadto.Dest_Wallet_ID,
            OTP: kafkadto.OTP,
            RewardPoints: '',
            REFID: '',
            Pin: '',
            TransectionId: kafkadto.TransactionId,
            Issuccess: true,
            Is_Financial: 'N',
          };
          break;
        case 126:
          this.notification_template = {
            KEYWORD: kafkadto.Keyword,
            TemplateID: 'INVALID_DESTNATION',
            LANG: kafkadto.Language,
            SourceMsisdn: kafkadto.Source_Wallet_ID,
            Amount: kafkadto.Amount,
            DestinationMsisdn: kafkadto.Dest_Wallet_ID,
            OTP: '',
            RewardPoints: '',
            REFID: '',
            Pin: '',
            TransectionId: kafkadto.TransactionId,
            Issuccess: false,
            Is_Financial: 'N',
          };
          break;
        case 999:
          this.notification_template = {
            KEYWORD: kafkadto.Keyword,
            TemplateID: 'FAIL_ALL',
            LANG: kafkadto.Language,
            SourceMsisdn: kafkadto.Source_Wallet_ID,
            Amount: kafkadto.Amount,
            DestinationMsisdn: kafkadto.Dest_Wallet_ID,
            OTP: '',
            RewardPoints: '',
            REFID: offnetresult.Msg,
            Pin: '',
            TransectionId: kafkadto.TransactionId,
            Issuccess: false,
            Is_Financial: 'N',
          };
          break;
      }
      winstonLog.log('info', 'OFFNET RESULT: %s', JSON.stringify(offnetresult));
      return this.notification_template;
    } else {
      winstonLog.log(
        'info',
        'TRANSACTION REQUEST ENTRY : %s',
        TransactionEntry,
      );
      this.notification_template = {
        KEYWORD: kafkadto.Keyword,
        TemplateID: 'FAIL_ALL',
        LANG: kafkadto.Language,
        SourceMsisdn: kafkadto.Source_Wallet_ID,
        Amount: kafkadto.Amount,
        DestinationMsisdn: kafkadto.Dest_Wallet_ID,
        OTP: '',
        RewardPoints: '',
        REFID: '',
        Pin: '',
        TransectionId: kafkadto.TransactionId,
        Issuccess: false,
        Is_Financial: 'N',
      };
      return this.notification_template;
    }
  }
  //Enter transaction request with status 0 into sw_tbl_transaction_request table.
  async TransactionEntry(createPaymentDto: KafkaDto) {
    const payload = JSON.parse(
      JSON.stringify(
        await this.DB.query(`exec [dbo].[SW_PROC_TRANSACTION_ENTRY]  
    @Source_Wallet_ID   = ${createPaymentDto.Source_Wallet_ID}
   ,@Dest_Wallet_ID     = ${createPaymentDto.Dest_Wallet_ID}
   ,@Transaction_ID      	= '${createPaymentDto.TransactionId}'
   ,@Amount        			= ${createPaymentDto.Amount}
   ,@Keyword        			= '${createPaymentDto.Keyword}'
   ,@Transaction_Fee      	= ${createPaymentDto.Transaction_Fee} 
   ,@Transaction_Comm      	= ${createPaymentDto.Transaction_Comm} 
   ,@Reference_ID       		='${createPaymentDto.Reference_ID}'
    
   ,@Charge_Payer       		=${createPaymentDto.Charge_Payer}
   ,@Commission_Receiver		=${createPaymentDto.Comission_Receiver}
   ,@Currency					= ${createPaymentDto.Currency}`),
      ),
    );
    return payload[0][0];
  }
}
