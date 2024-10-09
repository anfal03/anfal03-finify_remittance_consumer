import { IDatabaseConfig } from './database.interface';
import { decrypt } from '../../utils/cipher';
import 'dotenv/config';

export const databaseConfig: IDatabaseConfig = {
  development: {
    username: decrypt(JSON.parse(process.env.DB_USER)),
    password: decrypt(JSON.parse(process.env.DB_PASS)),
    database: decrypt(JSON.parse(process.env.DB_NAME_DEVELOPMENT)),
    host: decrypt(JSON.parse(process.env.DB_HOST)),
    port: Number(decrypt(JSON.parse(process.env.DB_PORT))),
    dialect: process.env.DB_DIALECT,
    define: {
      timestamps: false,
    },
    logging: true,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    define: {
      timestamps: false,
    },
    logging: false,
  },
  production: {
    username: decrypt(JSON.parse(process.env.DB_USER)),
    password: decrypt(JSON.parse(process.env.DB_PASS_PRODUCTION)),
    database: decrypt(JSON.parse(process.env.DB_NAME_PRODUCTION)),
    host: decrypt(JSON.parse(process.env.DB_HOST_PRODUCTION)),
    dialect: process.env.DB_DIALECT,
    port: Number(decrypt(JSON.parse(process.env.DB_PORT))),
    define: {
      timestamps: false,
    },
    logging: true,
  },
};
