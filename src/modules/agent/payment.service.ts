import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreatePaymentDto, CommitPaymentDto } from './dto/create-payment.dto';



import { AmlService } from './aml.service';
import { ThirdpartyapiService } from './thirdpartyapi.service';

import { DATABASE_CONNECTION } from '../../config/constants';
import { Sequelize } from 'sequelize-typescript';
import { Notification_Template } from './payment.interface';
import { ClientKafka } from '@nestjs/microservices';
import { winstonLog } from '../../config/winstonLog';
import { BonuseService } from './bonus.service';

@Injectable()
export class PaymentService {
  constructor(
    // @Inject(USER_REPOSITORY)
    //  private readonly userRepository: typeof PaymentModel,

    private readonly amlService: AmlService,
    private readonly thirdpartyService: ThirdpartyapiService,
    private readonly bonuseservice: BonuseService,
    @Inject(DATABASE_CONNECTION) private DB: Sequelize,
    private readonly logger: Logger,
    @Inject('kafka_module')
    private readonly client: ClientKafka,
  ) {}
  private notificationtemplate: Notification_Template;
  //   async findAll() {
  //     return this.userRepository.findAll<PaymentModel>();
  //   }

  //   async findOne(id: number) {
  //     return this.userRepository.findOne<PaymentModel>({
  //       where: { Transaction_ID: id },
  //     });
  //   }
  //KAFKA
  async onModuleInit() {
    [process.env.KAFKA_REQ_TOPIC].forEach((key) =>
      this.client.subscribeToResponseOf(`${key}`),
    );
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.close();
  }
  // GENERATE TRANSACTION ID
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
  // CHECK DESTINATION TYPE AND TRANSACTION TYPE IF IT IS DIRECT OR LEG1 OR LEG2
  async CheckDestinationType(MSISDN: string) {
    const payload = await this.DB.query(
      `EXEC dbo.SW_PROC_TRANSACTION_CHECK @MSISDN = ${MSISDN}`,
    );
    const data = JSON.stringify(payload);
    const objectvalue = JSON.parse(data);

    return objectvalue[0][0].Flag;
  }
  async TransactionEntry(
    createPaymentDto: CreatePaymentDto,
    TransactionID: string,
  ) {
    const payload = JSON.parse(
      JSON.stringify(
        await this.DB.query(`exec [dbo].[SW_PROC_TRANSACTION_ENTRY]  
    @Source_Wallet_ID   = ${createPaymentDto.Source_Wallet_ID}
   ,@Dest_Wallet_ID     = ${createPaymentDto.Dest_Wallet_ID}
   ,@Transaction_ID      	= '${TransactionID}'
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
  } // THIS FUNCTION DOES ENTRY OF THE TRANSACTION TO TRANSACTION REQUEST TABLE

  async Transaction(createPaymentDto: CreatePaymentDto) {
    //Generating Unique Transaction ID
    const Transaction = await this.TransactionEntry(
      createPaymentDto,
      createPaymentDto.TransactionId,
    ); // Insert Transaction request to SW_TBL_TRANSACTION_REQUEST table
    winstonLog.log(
      'info',
      'TRANSACTION ENTRY : %s',
      JSON.stringify(createPaymentDto),
    );
    //Checking if it is a special transaction or direct
    if (Transaction.ResponseCode == 100) {
      const Flag = await this.CheckDestinationType(
        createPaymentDto.Dest_Wallet_ID,
      );
      const Flag2 = await this.CheckDestinationType(
        createPaymentDto.Source_Wallet_ID,
      );
      winstonLog.log(
        'info',
        'TransactionId: %s , DestinationFlag: %s, SourceFlag: %s',
        createPaymentDto.TransactionId,
        Flag,
        Flag2,
      );

      if (Flag == 'DIRECT') {
        if (Flag2 == 'LEG1') {
          return this.ProcessPayment(
            createPaymentDto.TransactionId,
            createPaymentDto,
            Flag2,
          ); //this is if payment from special merchant to customer
        } else {
          return this.ProcessPayment(
            createPaymentDto.TransactionId,
            createPaymentDto,
            Flag,
          ); //any direct payment between customer and merchant
        }
      }
      return this.ProcessPayment(
        createPaymentDto.TransactionId,
        createPaymentDto,
        Flag,
      ); // payment between customer to special merchant
    } else {
      return Transaction;
    }
  }

  async sendsuccessnotification(createPaymentDto: CreatePaymentDto) {
    this.notificationtemplate = {
      KEYWORD: createPaymentDto.Keyword,
      TemplateID: '',
      LANG: createPaymentDto.Language,
      SourceMsisdn: createPaymentDto.Source_Wallet_ID,
      Amount: createPaymentDto.Amount,
      DestinationMsisdn: createPaymentDto.Dest_Wallet_ID,
      OTP: '',
      RewardPoints: '',
      REFID: createPaymentDto.Reference_ID,
      Pin: '',
      TransectionId: createPaymentDto.TransactionId,
      Issuccess: true,
      Is_Financial: 'Y',
      FullName: '',
      Charge: createPaymentDto.Transaction_Fee,
      Commission: createPaymentDto.Transaction_Comm,
    };
    winstonLog.log(
      'info',
      'Messeage Send -> %s',
      JSON.stringify(this.notificationtemplate),
    );
    const kafkaresponse = this.client.emit(
      process.env.KAFKA_NOTIFICATION_TOPIC,
      JSON.stringify(this.notificationtemplate),
    );
  }
  async sendfailnotification(
    createPaymentDto: CreatePaymentDto,
    NotificationFlag: string,
  ) {
    this.notificationtemplate = {
      KEYWORD: createPaymentDto.Keyword,
      TemplateID: NotificationFlag,
      LANG: createPaymentDto.Language,
      SourceMsisdn: createPaymentDto.Source_Wallet_ID,
      Amount: createPaymentDto.Amount,
      DestinationMsisdn: createPaymentDto.Dest_Wallet_ID,
      OTP: '',
      RewardPoints: '',
      REFID: createPaymentDto.Reference_ID,
      Pin: '',
      TransectionId: createPaymentDto.TransactionId,
      Issuccess: false,
      Is_Financial: 'Y',
      FullName: '',
      Charge: '',
      Commission: '',
    };
    winstonLog.log(
      'info',
      'Messeage Send -> %s',
      JSON.stringify(this.notificationtemplate),
    );
    const kafkaresponse = this.client.emit(
      process.env.KAFKA_NOTIFICATION_TOPIC,
      JSON.stringify(this.notificationtemplate),
    );
  }
  async notification(
    createPaymentDto: CommitPaymentDto,
    NotificationFlag: string,
  ) {
    this.notificationtemplate = {
      KEYWORD: createPaymentDto.Keyword,
      TemplateID: NotificationFlag,
      LANG: 'EN',
      SourceMsisdn: createPaymentDto.Source_Wallet_ID,
      Amount: createPaymentDto.Amount,
      DestinationMsisdn: createPaymentDto.Dest_Wallet_ID,
      OTP: '',
      RewardPoints: '',
      REFID: '',
      Pin: '',
      TransectionId: createPaymentDto.Transaction_ID,
      Issuccess: false,
      Is_Financial: 'Y',
      FullName: '',
      Charge: '',
      Commission: '',
    };
    winstonLog.log(
      'info',
      'Messeage Send -> %s' + JSON.stringify(this.notificationtemplate),
    );
    const kafkaresponse = this.client.emit(
      process.env.KAFKA_NOTIFICATION_TOPIC,
      JSON.stringify(this.notificationtemplate),
    );
    this.logger.debug('KAFKARESPONSE:', JSON.stringify(kafkaresponse));
  }
  async bonus(Transaction_ID: string, createPaymentDto: CreatePaymentDto) {
    const request = {
      TransactionId: Transaction_ID,
      Msisdn: createPaymentDto.Source_Wallet_ID,
      MerchantCode: createPaymentDto.Dest_Wallet_ID,
      Amount: createPaymentDto.Amount,
      Keyword: createPaymentDto.Keyword,
    };
    this.logger.log('Messeage Send -> ' + JSON.stringify(request));
    const kafkaresponse = this.client.emit(
      process.env.KAFKA_COMMISSION_TOPIC,
      JSON.stringify(request),
    );
    this.logger.debug('KAFKARESPONSE:', JSON.stringify(kafkaresponse));
  }
  async bonusLeg2(createPaymentDto: CommitPaymentDto) {
    const request = {
      TransactionId: createPaymentDto.Transaction_ID,
      Msisdn: createPaymentDto.Source_Wallet_ID,
      MerchantCode: createPaymentDto.Dest_Wallet_ID,
      Amount: createPaymentDto.Amount,
      Keyword: createPaymentDto.Keyword,
    };
    this.logger.log('Messeage Send -> ' + JSON.stringify(request));
    const kafkaresponse = this.client.emit(
      process.env.KAFKA_COMMISSION_TOPIC,
      JSON.stringify(request),
    );
    this.logger.debug('KAFKARESPONSE:', JSON.stringify(kafkaresponse));
  }
  //Payment Processing Function Starts
  async ProcessPayment(
    Transaction_Id: string,
    createPaymentDto: CreatePaymentDto,
    Flag: string,
  ) {
    //CHecking AML

    const AML = await this.amlService.AmlCheck(
      createPaymentDto.Source_Wallet_ID,
      createPaymentDto.Dest_Wallet_ID,
      createPaymentDto.Keyword,
      createPaymentDto.Amount,
    );

    //IF AML OK
    if (AML.Code == 100) {
      this.logger.log('AMLCHECK:', AML.Msg);
      const AMLPERSONAL = await this.amlService.AmlCheckPersonal(
        createPaymentDto.Source_Wallet_ID,
        createPaymentDto.Dest_Wallet_ID,
        createPaymentDto.Keyword,
        createPaymentDto.Amount,
      );
      if (AMLPERSONAL.Code == 100) {
        switch (Flag) {
          case 'DIRECT':
            this.logger.debug(
              `EXEC SW_PROC_TRANSACTION_BANKING @Transaction_ID=${Transaction_Id},@Flag=${Flag},@Source_Wallet_ID=${createPaymentDto.Source_Wallet_ID},@Dest_Wallet_ID=${createPaymentDto.Dest_Wallet_ID},@Amount=${createPaymentDto.Amount},@Keyword=${createPaymentDto.Keyword},@Transaction_Fee=${createPaymentDto.Transaction_Fee},@Transaction_Comm=${createPaymentDto.Transaction_Comm},@Reference_ID='${createPaymentDto.Reference_ID}',@Charge_Payer= ${createPaymentDto.Charge_Payer} , @Currency = ${createPaymentDto.Currency} , @Comission_Receiver = ${createPaymentDto.Comission_Receiver}`,
            );
            const direct = JSON.parse(
              JSON.stringify(
                await this.DB.query(
                  `EXEC SW_PROC_TRANSACTION_BANKING @Transaction_ID=${Transaction_Id},@Flag=${Flag},@Source_Wallet_ID=${createPaymentDto.Source_Wallet_ID},@Dest_Wallet_ID=${createPaymentDto.Dest_Wallet_ID},@Amount=${createPaymentDto.Amount},@Keyword=${createPaymentDto.Keyword},@Transaction_Fee=${createPaymentDto.Transaction_Fee},@Transaction_Comm=${createPaymentDto.Transaction_Comm},@Reference_ID='${createPaymentDto.Reference_ID}',@Charge_Payer= ${createPaymentDto.Charge_Payer} , @Currency = ${createPaymentDto.Currency} , @Comission_Receiver = ${createPaymentDto.Comission_Receiver}`,
                ),
              ),
            );
            winstonLog.log('debug', 'TRANSACTION RESULT: %s', direct[0][0]);
            if (direct[0][0].ResponseCode == 106) {
              this.sendsuccessnotification(createPaymentDto);
              this.bonuseservice.bonus(Transaction_Id, createPaymentDto);
            } else {
              switch (direct[0][0].ResponseCode) {
                case 999:
                  this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
                  break;

                case 991:
                  this.sendfailnotification(
                    createPaymentDto,
                    'FAIL_INVALIDCODE',
                  );
                  break;
                case 993:
                  this.sendfailnotification(
                    createPaymentDto,
                    'FAIL_SOURCE_DESTNATION_SAME',
                  );
                  break;
                case 998:
                  this.sendfailnotification(
                    createPaymentDto,
                    'FAIL_SOURCE_DESTNATION_SAME',
                  );
                  break;
                case 996:
                  this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
                  break;
                case 997:
                  this.sendfailnotification(
                    createPaymentDto,
                    'FAIL_INSUFFICIENT_BALANCE',
                  );
                  break;
                case 992:
                  this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
                  break;
                default:
                  this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
              }
            }

            return direct[0][0];
          case 'LEG1':
            const payload = await this.DB.query(
              `EXEC SW_PROC_TRANSACTION_BANKING @Transaction_ID=${Transaction_Id},@Flag=${Flag},@Source_Wallet_ID=${createPaymentDto.Source_Wallet_ID},@Dest_Wallet_ID=${createPaymentDto.Dest_Wallet_ID},@Amount=${createPaymentDto.Amount},@Keyword=${createPaymentDto.Keyword},@Transaction_Fee=${createPaymentDto.Transaction_Fee},@Transaction_Comm=${createPaymentDto.Transaction_Comm},@Reference_ID='${createPaymentDto.Reference_ID}',@Charge_Payer= ${createPaymentDto.Charge_Payer} , @Currency = ${createPaymentDto.Currency}, @Comission_Receiver = ${createPaymentDto.Comission_Receiver}`,
            );
            // this.logger.debug(
            //   `LEG1:EXEC SW_PROC_TRANSACTION_BANKING @Transaction_ID=${Transaction_Id},@Flag=${Flag},@Source_Wallet_ID=${createPaymentDto.Source_Wallet_ID},@Dest_Wallet_ID=${createPaymentDto.Dest_Wallet_ID},@Amount=${createPaymentDto.Amount},@Keyword=${createPaymentDto.Keyword},@Transaction_Fee=${createPaymentDto.Transaction_Fee},@Transaction_Comm=${createPaymentDto.Transaction_Comm},@Reference_ID='${createPaymentDto.Reference_ID}',@Charge_Payer= ${createPaymentDto.Charge_Payer} , @Currency = ${createPaymentDto.Currency}, @Comission_Receiver = ${createPaymentDto.Comission_Receiver}`,
            // );

            const data = JSON.stringify(payload);
            const objectvalue = JSON.parse(data);

            winstonLog.log('debug', 'LEG1:%s', data);
            if (objectvalue[0][0].ResponseCode == 106) {
              const result = await this.thirdpartyService.ThirdPartyApi(
                Transaction_Id,
                createPaymentDto.Keyword,
                createPaymentDto.Source_Wallet_ID,
                createPaymentDto.Dest_Wallet_ID,
                createPaymentDto.Amount,
                createPaymentDto.Reference_ID,
              );

              if (result.ResponseCode == 0) {
                const leg2 = JSON.parse(
                  JSON.stringify(
                    await this.DB.query(
                      `EXEC SW_PROC_TRANSACTION_BANKING @Transaction_ID=${Transaction_Id},@Flag='LEG2',@Source_Wallet_ID=${createPaymentDto.Source_Wallet_ID},@Dest_Wallet_ID=${createPaymentDto.Dest_Wallet_ID},@Amount=${createPaymentDto.Amount},@Keyword=${createPaymentDto.Keyword},@Transaction_Fee=${createPaymentDto.Transaction_Fee},@Transaction_Comm=${createPaymentDto.Transaction_Comm},@Reference_ID='${createPaymentDto.Reference_ID}',@Charge_Payer= ${createPaymentDto.Charge_Payer} , @Currency = ${createPaymentDto.Currency}, @Comission_Receiver = ${createPaymentDto.Comission_Receiver}`,
                    ),
                  ),
                );
                this.sendsuccessnotification(createPaymentDto);
                this.bonuseservice.bonus(Transaction_Id, createPaymentDto);
                return leg2[0][0];
              } else {
                if (result.ResponseCode == 200) {
                  return result;
                } else if (result.ResponseCode == 1) {
                  const payload = await this.DB.query(
                    `EXEC SW_PROC_CORE_ROLLBACK_BANKING @Transaction_ID=${Transaction_Id} , @FLAG = 'LEG2'`,
                  );
                  winstonLog.log(
                    'debug',
                    'ROLLBACKLEG2:%s',
                    JSON.stringify(payload),
                  );
                  if (Number(createPaymentDto.Transaction_Fee) >= 0) {
                    winstonLog.log('info', 'Calling Charge Roll Back');
                    const resultcharge = await this.DB.query(
                      `EXEC SW_PROC_CHARGE_ROLLBACK_BANKING @Transaction_ID=${Transaction_Id}, @FLAG = 'LEG2'`,
                    );
                    winstonLog.log(
                      'info',
                      'RESPOSNE FROM CHARGE ROLLBACK: %s',
                      JSON.stringify(resultcharge),
                    );
                  }
                  this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
                  return {
                    TransactionId: Transaction_Id,
                    ResponseCode: 999,
                    ResponseDescription: 'Transaction Failed',
                  };
                } else if (result.Retry == 0) {
                  const request = {
                    TransactionId: Transaction_Id,
                    Msisdn: createPaymentDto.Source_Wallet_ID,
                    MerchantCode: createPaymentDto.Dest_Wallet_ID,
                    Amount: createPaymentDto.Amount,
                    ReferenceId: createPaymentDto.Reference_ID,
                    Keyword: createPaymentDto.Keyword,
                  };
                  winstonLog.log(
                    'info',
                    'Messeage Send -> %s' + JSON.stringify(request),
                  );
                  //write to bill topic for bill call
                  if (
                    createPaymentDto.Keyword == String(process.env.BILL_KEYWORD)
                  ) {
                    const kafkaresponse = this.client.emit(
                      process.env.KAFKA_REQ_BILL_TOPIC,
                      JSON.stringify(request),
                    );
                  } else {
                    const kafkaresponse = this.client.emit(
                      //   process.env.KAFKA_REQ_TOPIC,
                      createPaymentDto.Dest_Wallet_ID,
                      JSON.stringify(request),
                    );
                  }
                  return {
                    TransactionId: Transaction_Id,
                    ResponseCode: 200,
                    ResponseDescription: 'Transaction Submitted for Processing',
                  };
                } else {
                  const payload = await this.DB.query(
                    `EXEC SW_PROC_CORE_ROLLBACK_BANKING @Transaction_ID=${Transaction_Id} , @FLAG = 'LEG2'`,
                  );
                  winstonLog.log(
                    'debug',
                    'ROLLBACKLEG2:%s',
                    JSON.stringify(payload),
                  );
                  if (Number(createPaymentDto.Transaction_Fee) >= 0) {
                    winstonLog.log('info', 'Calling Charge Roll Back');
                    const resultcharge = await this.DB.query(
                      `EXEC SW_PROC_CHARGE_ROLLBACK_BANKING @Transaction_ID=${Transaction_Id}, @FLAG = 'LEG2'`,
                    );
                    winstonLog.log(
                      'info',
                      'RESPOSNE FROM CHARGE ROLLBACK: %s',
                      JSON.stringify(resultcharge),
                    );
                  }
                  switch (direct[0][0].ResponseCode) {
                    case 999:
                      this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
                      break;

                    case 991:
                      this.sendfailnotification(
                        createPaymentDto,
                        'FAIL_INVALIDCODE',
                      );
                      break;
                    case 993:
                      this.sendfailnotification(
                        createPaymentDto,
                        'FAIL_SOURCE_DESTNATION_SAME',
                      );
                      break;
                    case 998:
                      this.sendfailnotification(
                        createPaymentDto,
                        'FAIL_SOURCE_DESTNATION_SAME',
                      );
                      break;
                    case 996:
                      this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
                      break;
                    case 997:
                      this.sendfailnotification(
                        createPaymentDto,
                        'FAIL_INSUFFICIENT_BALANCE',
                      );
                      break;
                    case 992:
                      this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
                      break;
                    default:
                      this.sendfailnotification(createPaymentDto, 'FAIL_ALL');
                  }
                  return {
                    TransactionId: Transaction_Id,
                    ResponseCode: 999,
                    ResponseDescription: 'Transaction Failed',
                  };
                }
              }
            } else return objectvalue[0][0];
        }
      } else {
        winstonLog.log('debug', 'RESPONSE:%s', AMLPERSONAL.Msg);
        switch (AMLPERSONAL.Code) {
          case 997:
            this.sendfailnotification(
              createPaymentDto,
              'FAIL_SERVICE_NOT_ALLOWED',
            );
            break;
          case 998:
            this.sendfailnotification(
              createPaymentDto,
              'FAIL_AML_EXCEEDS_DESTINATION',
            );
            break;
          case 999:
            this.sendfailnotification(
              createPaymentDto,
              'FAIL_AML_EXCEEDS_SOURCE',
            );
            break;
        }
        return {
          TransactionId: Transaction_Id,
          ResponseCode: AMLPERSONAL.Code,
          ResponseDescription: AMLPERSONAL.Msg,
        };
      }
    } else {
      //IF AML LIMITED FAILS
      winstonLog.log('debug', 'RESPONSE:%s', AML.Msg);
      switch (AML.Code) {
        case 997:
          this.sendfailnotification(
            createPaymentDto,
            'FAIL_SERVICE_NOT_ALLOWED',
          );
          break;
        case 998:
          this.sendfailnotification(
            createPaymentDto,
            'FAIL_AML_EXCEEDS_DESTINATION',
          );
          break;
        case 999:
          this.sendfailnotification(
            createPaymentDto,
            'FAIL_AML_EXCEEDS_SOURCE',
          );
          break;
      }

      return {
        TransactionId: Transaction_Id,
        ResponseCode: 999,
        ResponseDescription: AML.Msg,
      };
    }
  }

  //Roll back function for leg 2

  async Rollback(TransactionID: number) {
    const data = await this.DB.query(
      `EXEC dbo.SW_PROC_CORE_ROLLBACK_BANKING @Transaction_ID=${TransactionID} , @FLAG = 'DIRECT'`,
    );

    return data[0][0];
  }
  async Leg2Rollback(TransactionID: number) {
    const payload = JSON.parse(
      JSON.stringify(
        await this.DB.query(
          `EXEC SW_PROC_CORE_ROLLBACK_BANKING @Transaction_ID=${TransactionID} , @FLAG = 'LEG2'`,
        ),
      ),
    );
    const resultcharge = JSON.parse(
      JSON.stringify(
        await this.DB.query(
          `EXEC SW_PROC_CHARGE_ROLLBACK_BANKING @Transaction_ID=${TransactionID}, @FLAG = 'LEG2'`,
        ),
      ),
    );
    winstonLog.log('info', 'ROLLBACK:%s', JSON.stringify(payload));
    winstonLog.log('info', 'ROLLBACKCHARGE: %s', JSON.stringify(resultcharge));
    // if (payload[0][0].Code == 100)
    //   return {
    //     TransactionId: TransactionID,
    //     ResponseCode: payload[0][0].Code,
    //     ResponseDescription: payload[0][0].Msg,
    //   };
    return {
      TransactionId: TransactionID,
      ResponseCode: payload[0][0].Code,
      ResponseDescription: payload[0][0].Msg,
    };
  }
  async Leg2Commit(commitPaymentDto: CommitPaymentDto) {
    const payload = JSON.parse(
      JSON.stringify(
        await this.DB.query(
          `Exec SW_PROC_TRANSACTION_LEG2_COMMIT @Transaction_ID = ${commitPaymentDto.Transaction_ID}, @Source_Wallet_ID = ${commitPaymentDto.Source_Wallet_ID} , @Dest_Wallet_ID = ${commitPaymentDto.Dest_Wallet_ID}, @Amount = ${commitPaymentDto.Amount}`,
        ),
      ),
    );
    this.bonusLeg2(commitPaymentDto);
    winstonLog.log(
      'info',
      'TRANSACTION_REQUESTQUERY:%S',
      JSON.stringify(payload),
    );
    this.notification(commitPaymentDto, 'SUCCESS');
    return payload[0][0];
  }
}
