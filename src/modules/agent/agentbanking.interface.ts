export interface ResponseModel {
  Source_Wallet_ID: number;
  Amount: number;
  Dest_Wallet_ID: number;
  Keyword: string;
  Transaction_Fee: number;
  Transaction_Comm: number;
  Reference_ID: string;
  TransactionId: number;
  ResponseCode: number;
  ResponseDescription: string;
}
export interface RollbackResponseModel {
  TransactionId: number;
  ResponseCode: number;
  ResponseDescription: string;
}
export interface ApiModel {
  TransactionId: string;
  ResponseCode: number;
  ResponseDescription: string;
  ServiceUrl: string;
  Retry: number;
}

export interface AmlModel {
  Code: number;
  Msg: string;
  SOURCE_WALLET: bigint;
  DESTINATION_WALLET: bigint;
}
