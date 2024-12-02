import { UUID } from 'crypto';
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'Logs' })
export class LogModel extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  id: bigint;
  @Column({
    type: DataType.STRING(255),
  })
  level: string;
  @Column({
    type: DataType.TEXT,
  })
  message: string;
  @Column({
    type: DataType.DATE,
  })
  createdAt: string;
  @Column({
    type: DataType.TEXT,
  })
  appname: string;

  @Column({
    type: DataType.TEXT,
  })
  sourceMsisdn: string;

  @Column({
    type: DataType.TEXT,
  })
  destinationMsisdn: string;
  
  @Column({
    type: DataType.TEXT,
  })
  refId: string;

  @Column({
    type: DataType.TEXT,
  })
  transactionid: string;
}
