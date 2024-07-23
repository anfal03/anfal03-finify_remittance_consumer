import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreatePaymentDto {
  @IsNotEmpty()
  @ApiProperty()
  readonly Keyword: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly Source_Wallet_ID: string;
  @ApiProperty()
  readonly TransactionId: string;
  @ApiProperty()
  readonly Dest_Wallet_ID: string;
  @ApiProperty()
  readonly Amount: string;
  @ApiProperty()
  readonly Transaction_Fee: string;
  @ApiProperty()
  readonly Transaction_Comm: string;
  @ApiProperty()
  readonly Charge_Payer: bigint;
  @ApiProperty()
  readonly Currency: string;
  @ApiProperty()
  readonly Reference_ID: string;
  @ApiProperty()
  readonly Comission_Receiver: bigint;
  @ApiProperty()
  readonly Language: string;
}

export class CommitPaymentDto {
  @IsNotEmpty()
  @ApiProperty()
  readonly Transaction_ID: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly Source_Wallet_ID: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Dest_Wallet_ID: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Amount: string;
  @ApiProperty()
  readonly Keyword: string;
}
