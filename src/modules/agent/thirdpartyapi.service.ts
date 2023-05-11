import { Injectable, Inject, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../config/constants';
import { Sequelize } from 'sequelize-typescript';
import { ApiModel } from './agentbanking.interface';
import axios from 'axios';

import { KafkaDto } from './dto/kafka.dto';
@Injectable()
export class ThirdpartyapiService {
  constructor(
    @Inject(DATABASE_CONNECTION) private DB: Sequelize,
    private readonly logger: Logger,
  ) {}
  async CheckServiceUrl(MSISDN_SOURCE: string, MSISDN_DESTINATION: string) {
    const payload = JSON.parse(
      JSON.stringify(
        await this.DB.query(
          `	EXEC SW_PROC_GET_SERVICE_URL @MSISDN = ${MSISDN_DESTINATION}`,
        ),
      ),
    );
    this.logger.debug('DESTINATION_URL_CHECK:', JSON.stringify(payload));
    let final = payload[0][0].Code;
    let URL: string;
    let is_retry: bigint;
    if (payload[0][0].Code == 999) {
      const src = JSON.parse(
        JSON.stringify(
          await this.DB.query(
            `	EXEC SW_PROC_GET_SERVICE_URL @MSISDN = ${MSISDN_SOURCE}`,
          ),
        ),
      );
      final = src[0][0].Code;
      URL = src[0][0].ServiceUrl;
      is_retry = src[0][0].RetryFlag;
      if (final == 999) return { RESPONSECODE: final, SERVICEURL: '' };
    } else {
      final = payload[0][0].Code;
      URL = payload[0][0].ServiceUrl;
      is_retry = payload[0][0].RetryFlag;
      return { RESPONSECODE: final, SERVICEURL: URL, Retry: is_retry };
    }

    return { RESPONSECODE: final, SERVICEURL: URL, Retry: is_retry };
  }
  async ThirdPartyApi(
    Transaction_Id: string,
    Keyword: string,
    Source_Wallet_ID: string,
    Dest_Wallet_ID: string,
    Amount: string,
    Reference_ID: string,
  ): Promise<ApiModel> {
    const payload = await this.CheckServiceUrl(
      Source_Wallet_ID,
      Dest_Wallet_ID,
    );
    this.logger.debug('SERVICECHECKRESULT:', JSON.stringify(payload));
    if (payload.RESPONSECODE == 100) {
      return await axios({
        url: `${payload.SERVICEURL}`,
        method: 'POST',
        data: {
          TransactionId: Transaction_Id,
          Msisdn: Source_Wallet_ID,
          MerchantCode: Dest_Wallet_ID,
          Amount: Amount,
          ReferenceId: Reference_ID,
        },
        headers: {
          module: process.env.AUTH_MODULE,
          'Content-type': 'application/json',
        },
        timeout: 1500,
      })
        .then(function (response) {
          console.log(response.data);
          return response.data;
        })
        .catch(function (error) {
          console.log(error);
          return {
            TransactionId: '',
            ResponseCode: 999,
            ResponseDescriptioon: 'REQUEST TIME OUT',
            ServieUrl: payload.SERVICEURL,
            Retry: payload.Retry,
          };
        });
    } else
      return {
        TransactionId: '',
        ResponseCode: 999,
        ResponseDescription: 'SERVICE URL NOT CONFIGURED',
        ServiceUrl: '',
        Retry: 0,
      };
  }
  async GetAmlConfirmResponse(kafkaDto: KafkaDto) {
    return await axios({
      url: `${process.env.PAYMENTPRODUCER_URL}`,
      method: 'POST',
      data: kafkaDto,
      headers: {
        module: process.env.AUTH_MODULE,
        'Content-type': 'application/json',
      },
      timeout: 3000,
    })
      .then(function (response) {
        console.log(response.data);
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
        return {
          TransactionId: '',
          ResponseCode: 999,
          ResponseDescriptioon: 'REQUEST TIME OUT',
          ServieUrl: process.env.JSONRX_URL,
          Retry: 3,
        };
      });
    //JSONRX_URL
  }
  async OffnetProcess(kafkaDto: KafkaDto) {
    return await axios({
      url: `${process.env.OFFNET_URL}`,
      method: 'POST',
      data: kafkaDto,
      headers: {
        module: process.env.AUTH_MODULE,
        'Content-type': 'application/json',
      },
      timeout: 3000,
    })
      .then(function (response) {
        console.log(response.data);
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
        return {
          TransactionId: '',
          ResponseCode: 999,
          ResponseDescriptioon: 'REQUEST TIME OUT',
          ServieUrl: process.env.JSONRX_URL,
          Retry: 3,
        };
      });
    //JSONRX_URL
  }
}
