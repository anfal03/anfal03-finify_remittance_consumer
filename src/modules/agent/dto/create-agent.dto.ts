import {
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsEnum,
  isEmpty,
  isBoolean,
  IsInt,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateAgentDto {
  @IsNotEmpty()
  @ApiProperty()
  readonly Keyword: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly Source_Wallet_ID: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Dest_Wallet_ID: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Amount: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Transaction_Fee: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Transaction_Comm: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Charge_Payer: bigint;
  @ApiProperty()
  readonly Currency: string;
  @ApiProperty()
  readonly Reference_ID: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Comission_Receiver: bigint;
  @ApiProperty()
  readonly Language: string;
  @IsNotEmpty()
  @ApiProperty()
  @IsInt()
  readonly PIN: bigint;
}

export class OffnetWithdrawalDto {
  @IsNotEmpty()
  @ApiProperty()
  readonly Keyword: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly Source_Wallet_ID: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Dest_Wallet_ID: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Amount: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Transaction_Fee: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Transaction_Comm: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Charge_Payer: bigint;
  @ApiProperty()
  readonly Currency: string;
  @ApiProperty()
  readonly Reference_ID: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly Comission_Receiver: bigint;
  @ApiProperty()
  readonly Language: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly PIN: bigint;
  @IsNotEmpty()
  @ApiProperty()
  readonly OFFNETPIN: bigint;
}

export class SendUSSDDto {
  @IsNotEmpty()
  @ApiProperty()
  readonly KEYWORD: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly SOURCEMSISDN: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly DESTMSISDN: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly AMOUNT: string;
  @ApiProperty()
  readonly LANG: string;
  @IsNotEmpty()
  @ApiProperty()
 
  readonly PIN: string;
}
export class AmlCheckDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 4, { message: 'Keyword should be 4 character' })
  @ApiProperty()
  readonly Keyword: string;
  @MinLength(8)
  @IsNotEmpty()
  @ApiProperty()
  readonly Msisdn: string;
  @MinLength(8)
  @IsNotEmpty()
  @ApiProperty()
  readonly DestinationMsisdn: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly Currency: string;
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'PIN should be  6 digit' })
  @ApiProperty()
  readonly Pin: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly Amount: string;
  @IsString()
  readonly ReferenceId: string;
  @ApiProperty()
  readonly LANG: string;
}
