import { Table, Column, Model, DataType } from 'sequelize-typescript';
import {
  DecimalDataType,
  IntegerDataType,
  TinyIntegerDataType,
} from 'sequelize/types';

@Table({ tableName: 'SW_TBL_KEYWORD' })
export class KeywordModel extends Model {
  @Column({
    type: DataType.STRING(5),
    allowNull: false,

    primaryKey: true,
  })
  Keyword: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  Keyword_Description: string;

  @Column({
    type: DataType.STRING(1),
    allowNull: false,
  })
  Keyword_Scope: string;

  @Column({
    type: DataType.STRING(20),
  })
  Created_By: string;
  @Column({
    type: DataType.DATEONLY,
  })
  Created_Date: Date;
  @Column({
    type: DataType.STRING(20),
  })
  Modified_By: string;
  @Column({
    type: DataType.DATEONLY,
  })
  Modified_Date: Date;
  @Column({
    type: DataType.STRING(20),
  })
  Approved_By: string;
  @Column({
    type: DataType.DATEONLY,
  })
  Approved_Date: Date;
  @Column({
    type: DataType.TINYINT,
  })
  Is_Financial: TinyIntegerDataType;
  @Column({
    type: DataType.STRING(1),
  })
  Chargeable: string;
  @Column({
    type: DataType.STRING(1),
  })
  Kc_Id_Lookup: string;
  @Column({
    type: DataType.STRING(1),
  })
  Commissionable: string;
  @Column({
    type: DataType.STRING(1),
  })
  Kcm_Id_Lookup: string;
  @Column({
    type: DataType.NUMBER,
  })
  MINIMUM_TRAN_AMOUNT: number;
  @Column({
    type: DataType.STRING(10),
  })
  INVOLVED_PARTY: string;
  @Column({
    type: DataType.TINYINT,
  })
  ApplyTds: IntegerDataType;
  @Column({
    type: DataType.TINYINT,
  })
  Is_Reward_Applicable: IntegerDataType;
  @Column({
    type: DataType.TINYINT,
  })
  Is_System_Keyword: IntegerDataType;
  @Column({
    type: DataType.TINYINT,
  })
  Service_Status: IntegerDataType;
}
