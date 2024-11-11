import { IDatabaseConfig } from './database.interface';
import 'dotenv/config';
import { decrypt } from '@helpers/cipher';

const IS_CRD_PLAIN = process.env.IS_CRD_PLAIN == 'true' ? true : false
const DB_USER = IS_CRD_PLAIN ? process.env.DB_USER : decrypt(process.env.DB_USER)
const DB_PASS = IS_CRD_PLAIN ? process.env.DB_PASS : decrypt(process.env.DB_PASS )
const DB_HOST = IS_CRD_PLAIN ? process.env.DB_HOST : decrypt(process.env.DB_HOST )
const DB_PORT = IS_CRD_PLAIN ? process.env.DB_PORT : decrypt(process.env.DB_PORT)
const DB_DIALECT = IS_CRD_PLAIN ? process.env.DB_DIALECT : decrypt(process.env.DB_DIALECT )
const DB_NAME_DEVELOPMENT = IS_CRD_PLAIN ? process.env.DB_NAME_DEVELOPMENT : decrypt(process.env.DB_NAME_DEVELOPMENT )
const DB_NAME_TEST = IS_CRD_PLAIN ? process.env.DB_NAME_TEST : decrypt(process.env.DB_NAME_TEST )
const DB_NAME_PRODUCTION = IS_CRD_PLAIN ? process.env.DB_NAME_PRODUCTION : decrypt(process.env.DB_NAME_PRODUCTION )
const DB_PASS_PRODUCTION = IS_CRD_PLAIN ? process.env.DB_PASS_PRODUCTION : decrypt(process.env.DB_PASS_PRODUCTION )
const DB_HOST_PRODUCTION = IS_CRD_PLAIN ? process.env.DB_HOST_PRODUCTION : decrypt(process.env.DB_HOST_PRODUCTION )

export const databaseConfig: IDatabaseConfig = {
  development: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME_DEVELOPMENT,
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: DB_DIALECT,
    define: {
      timestamps: false,
    },
    logging: true,
  },
  test: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME_TEST,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    define: {
      timestamps: false,
    },
    logging: false,
  },
  production: {
    username: DB_USER,
    password: DB_PASS_PRODUCTION,
    database: DB_NAME_PRODUCTION,
    host: DB_HOST_PRODUCTION,
    dialect: DB_DIALECT,
    port: Number(DB_PORT),
    define: {
      timestamps: false,
    },
    logging: true,
  },
};
