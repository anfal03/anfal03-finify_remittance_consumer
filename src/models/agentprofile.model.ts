import { Model, Column, Table, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'SW_TBL_PROFILE_AGENTS',
})
export class AgentPorfileModel extends Model {
  @Column({
    primaryKey: true,
    type: DataType.BIGINT,
  })
  MSISDN: number;

  @Column(DataType.STRING)
  PIN: string;

  @Column(DataType.STRING)
  Acc_Code: string;

  @Column(DataType.STRING)
  Agent_Name: string;

  @Column(DataType.STRING)
  Agent_Nature: string;

  @Column(DataType.STRING)
  Reg_Type: string;

  @Column(DataType.STRING)
  License_No: string;

  @Column(DataType.STRING)
  Agent_Group: string;

  @Column(DataType.STRING)
  Business_Type: string;

  @Column(DataType.STRING)
  Email: string;

  @Column(DataType.STRING)
  Country: string;

  @Column(DataType.STRING)
  District: string;

  @Column(DataType.STRING)
  City: string;

  @Column(DataType.TINYINT)
  Wallet_Type: number;

  @Column(DataType.TINYINT)
  Keyword_Commission_ID: number;

  @Column(DataType.INTEGER)
  Keyword_Charge_Id: number;

  @Column(DataType.BIGINT)
  PARENT_MSISDN: number;

  @Column({
    type: DataType.TINYINT,
    defaultValue: 0,
  })
  Fail_Attempt: number;

  @Column(DataType.TINYINT)
  Status: number;

  @Column(DataType.STRING)
  Id_Type: string;

  @Column(DataType.STRING)
  Id_Number: string;

  @Column(DataType.STRING)
  Id_IssuedPlace: string;

  @Column(DataType.STRING)
  Id_IssuedDate: string;

  @Column(DataType.STRING)
  Id_ExpiryDate: string;

  @Column(DataType.STRING)
  Id_Image: string;

  @Column(DataType.STRING)
  License_Image: string;

  @Column(DataType.STRING)
  Agreement_Image: string;

  @Column(DataType.STRING)
  Contact1_Name: string;

  @Column(DataType.STRING)
  Contact1_Mobile: string;

  @Column(DataType.STRING)
  Contact1_Phone: string;

  @Column(DataType.STRING)
  Contact1_Email: string;

  @Column(DataType.STRING)
  Contact2_Name: string;

  @Column(DataType.STRING)
  Contact2_Mobile: string;

  @Column(DataType.STRING)
  Contact2_Phone: string;

  @Column(DataType.STRING)
  Contact2_Email: string;

  @Column(DataType.STRING)
  Latitute: string;

  @Column(DataType.STRING)
  Longitute: string;

  @Column(DataType.STRING)
  Created_By: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  Created_Date: Date;

  @Column(DataType.STRING)
  Modified_By: string;

  @Column(DataType.DATE)
  Modified_Date: Date;

  @Column(DataType.STRING)
  Approved_By: string;

  @Column(DataType.DATE)
  Approved_Date: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  Is_Kna_Uploaded: boolean;

  @Column(DataType.DATE)
  Location_Updated: Date;

  @Column(DataType.STRING)
  Branch_Code: string;

  @Column(DataType.STRING)
  Communice: string;

  @Column(DataType.STRING)
  Street_House_No: string;

  @Column(DataType.STRING)
  ID_Front_Image: string;

  @Column(DataType.STRING)
  ID_Back_Image: string;

  @Column({
    type: DataType.TINYINT,
    defaultValue: 0,
  })
  Reset_Pin_Attempt: number;

  @Column(DataType.STRING)
  Vat_Setting!: string;

  @Column(DataType.BOOLEAN)
  Is_Kna_Pending: boolean;

  @Column(DataType.BOOLEAN)
  CustomerCreate: boolean;

  @Column(DataType.INTEGER)
  Exchange_Rate_Id: bigint;
  @Column({
    type: DataType.SMALLINT,
    defaultValue: 0,
  })
  new_pin_set: number;
  @Column({
    type: DataType.SMALLINT,
    defaultValue: 0,
  })
  Is_Special: number;
}
