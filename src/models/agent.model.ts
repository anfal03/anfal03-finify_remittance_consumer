import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'SW_TBL_TRANSACTION_DETAILS' })
export class AgentModel extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,

    primaryKey: true,
  })
  Transaction_ID: bigint;

  @Column({
    type: DataType.STRING(5),
  })
  Keyword: string;

  @Column({
    type: DataType.BIGINT,
  })
  Source_Wallet_ID: bigint;
  @Column({
    type: DataType.BIGINT,
  })
  Dest_Wallet_ID: bigint;
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  Amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  Souce_Balance_Before: number;
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  Source_Balance_After: number;
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  Dest_Balance_Before: number;
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  Dest_Balance_After: number;

  @Column({
    type: DataType.DATEONLY,
  })
  Created_Date: Date;
  @Column({
    type: DataType.NUMBER,
  })
  Transaction_Fee: number;

  @Column({
    type: DataType.NUMBER,
  })
  Transaction_Comm: number;

  @Column({
    type: DataType.TINYINT,
  })
  Status: bigint;
  @Column({
    type: DataType.STRING(100),
  })
  Reference_ID: string;
  @Column({
    type: DataType.BIGINT,
  })
  Fee_Payer: bigint;
  @Column({
    type: DataType.BIGINT,
  })
  Commission_Receiver: bigint;
  @Column({
    type: DataType.BIGINT,
  })
  Reward_Receiver: bigint;
  @Column({
    type: DataType.BIGINT,
  })
  Reward_Point: bigint;
  @Column({
    type: DataType.NUMBER,
  })
  Distributer_Commission: number;
  @Column({
    type: DataType.BIGINT,
  })
  Distributer_Msisdn: bigint;
  @Column({
    type: DataType.DATE,
  })
  TransactionDate: Date;
  @Column({
    type: DataType.STRING(10),
  })
  Currency: string;
  @Column({
    type: DataType.NUMBER,
  })
  Ex_Rate: number;
  @Column({
    type: DataType.NUMBER,
  })
  Exchanged_Amount: number;
  @Column({
    type: DataType.NUMBER,
  })
  Charge_Account_Balance_Before: number;
  @Column({
    type: DataType.NUMBER,
  })
  Charge_Account_Balance_After: number;
  @Column({
    type: DataType.NUMBER,
  })
  Comission_Account_Balance_Before: number;
  @Column({
    type: DataType.NUMBER,
  })
  Comission_Account_Balance_After: number;
  @Column({
    type: DataType.BIGINT,
  })
  Reward_Point_Balance_before: bigint;
  @Column({
    type: DataType.BIGINT,
  })
  Reward_Point_Balance_After: bigint;
  @Column({
    type: DataType.TINYINT,
  })
  Type_Of_Transaction: bigint;
  @Column({
    type: DataType.NUMBER,
  })
  Temp_Account_balance_before: number;
  @Column({
    type: DataType.NUMBER,
  })
  Temp_Account_balance_After: number;
}
