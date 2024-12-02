import { createLogger, format, transports } from 'winston';
import { Sequelize } from 'sequelize';
import { sequelizeConfig } from '../../config/sequelize.config';
import PostgresTransport from './postgres.transport';
import { LogModel } from 'src/models';

const { combine, timestamp, label, printf, prettyPrint, errors, colorize } =
  format;
const myConfig = {
  levels: {
    error: 0,
    warn: 1,
    data: 2,
    info: 3,
    debug: 4,
    verbose: 5,
    silly: 6,
    http: 7,
  },
  colors: {
    error: 'red',
    warn: 'orange',
    data: 'grey',
    info: 'green',
    debug: 'yellow',
    verbose: 'cyan',
    silly: 'magenta',
    http: 'magenta',
  },
};
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
const myConfiglevelsKeyArray = Object.keys(myConfig.levels);
const logger = createLogger({
  level: 'info',
  format: format.combine(
    label({ label: 'RILAC' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(),
    format.simple(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [
    new transports.Console({
      level: `${myConfiglevelsKeyArray[myConfiglevelsKeyArray.length - 1]}`,
      format: combine(format.colorize(), myFormat),
    }),
    new PostgresTransport(LogModel),
  ],
});

export default logger;
