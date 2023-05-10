import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { TinyIntegerDataType } from 'sequelize/types';

@Table({ tableName: 'SW_TBL_JSONRX_REGISTRATION' })
export class JsonrxModel extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,

    primaryKey: true,
  })
  MSISDN: bigint;

  @Column({
    type: DataType.STRING(100),
  })
  OTP: string;

  @Column({
    type: DataType.STRING(100),
  })
  Device_Password: string;

  @Column({
    type: DataType.DATEONLY,
  })
  Created_Date: Date;

  @Column({
    type: DataType.STRING(100),
  })
  IMEI: string;

  @Column({
    type: DataType.TINYINT,
  })
  OTP_Used: TinyIntegerDataType;
  @Column({
    type: DataType.STRING(50),
  })
  App_Version: string;
  @Column({
    type: DataType.STRING(50),
  })
  Phone_Brand: string;
  @Column({
    type: DataType.STRING(50),
  })
  Phone_Os: string;
  @Column({
    type: DataType.STRING(50),
  })
  Os_Version: string;
  @Column({
    type: DataType.STRING(200),
  })
  Device_Id: string;
  @Column({
    type: DataType.STRING(3),
  })
  Language: string;
  @Column({
    type: DataType.TEXT,
  })
  ACCESS_TOKEN: string;
}
