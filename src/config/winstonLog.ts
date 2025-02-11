import {LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import winston, { createLogger, format, transports, LoggerOptions} from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { SequelizeTransport } from './sequelize-transport'; // Ensure this path is correct
import { sequelizeWriteInstance as sequelize } from './sequelize-instance'; // Ensure this path is correct

const { combine, timestamp, label, printf, prettyPrint,errors,colorize  } = format

const filter_fields = ['password','newpassword', 'pin', 'PIN', 'Pin','cvc', 'userName', 'passWord', 'cardNumber', 'cavv', 'expiry', 'CAVV']

const myFormat = printf(({ level, message, label, timestamp }) => {

  return `${timestamp} [${label}] ${level}: ${message}`;
})

  // Custom formatter to sanitize sensitive data
  const filterSensitiveData = format((info) => {
    // Check if interpolation arguments exist
    const splatArgs = info[Symbol.for('splat')];
    if (Array.isArray(splatArgs)) {
      // Sanitize each argument in the splat array
      const sanitizedArgs = splatArgs.map((arg) => {
        if (typeof arg === 'object' && arg !== null) {
          const sanitized = { ...arg };
          filter_fields.forEach((key) => {
            if (sanitized[key]) sanitized[key] = '[FILTERED]';
          });
          return sanitized;
        }
        return arg;
      });
      info[Symbol.for('splat')] = sanitizedArgs;
    }
    return info;
  });

const infotransport = new DailyRotateFile({
                    filename: 'info-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    dirname: `logs/`,
                    level: 'info',
                    handleExceptions: true,
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d'

})

const errortransport = new DailyRotateFile({
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          dirname: `logs/`,
          level: 'error',
          handleExceptions: true,
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d'

})

const myConfig = {
  levels: {
    error: 0,
    warn: 1,
    data: 2,
    info: 3,
    debug: 4,
    verbose: 5,
    silly: 6,
    http: 7
  },
  colors: {
    error: 'red',
    warn: 'orange',
    data: 'grey',
    info: 'green',
    debug: 'yellow',
    verbose: 'cyan',
    silly: 'magenta',
    http: 'magenta' 
  },
}

const myConfiglevelsKeyArray = Object.keys(myConfig.levels)

const winstonLogOptions = { 
          levels: myConfig.levels,
          format: combine(
            label({ label: 'app' }),    
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
            filterSensitiveData(),
            format.splat(),
            format.simple(),
            format((info) => {
              // Attach transaction ID from request context or default if not available
              info.transactionid_for_log = info.transactionid_for_log || 'N/A';
              return info
            })(),
            myFormat,
          ),  
          transports: [
            new transports.Console({
              level : `${myConfiglevelsKeyArray[myConfiglevelsKeyArray.length - 1]}`,
              format: combine(
                format.colorize(),
                myFormat
              )
            }),
            infotransport,
            errortransport,
            new SequelizeTransport({ sequelize, level: `${myConfiglevelsKeyArray[myConfiglevelsKeyArray.length - 1]}`})

          ]
}

export const winstonLog = createLogger({...winstonLogOptions})

export const nestwinstonLog = WinstonModule.createLogger(winstonLogOptions)

export const requestBodyLog = (requestObj) => {

  let reqobj = {...requestObj}
  //filter....
  filter_fields.map(item => {
     if (item in reqobj) {
      reqobj[item] = "[FILTERED]"
     }
  })
  //log request body...
  winstonLog.log('info',' Request Body :  %o', reqobj, { label: 'Request' })
}
export const responseBodyLog = (responseObj) => {
  //log response body...
 winstonLog.log('info',' Response Body :  %o', responseObj || {}, { label: 'Response' })
}

export const HttpUrlLog = (message) => {
 //log http info...
 winstonLog.log('info',message, { label: 'Route' })
}

export const HttpPortLog = (port) => {
  //log http info...
  winstonLog.log('debug','Nest Application Run In Port %s ',port, { label: 'Route' })
 } 


 export const LogFilter = (requestObj) => {
  let reqobj = (typeof requestObj === 'object') ? {...requestObj} : {}
  //filter....
  filter_fields.map(item => {
     if (item in reqobj) {
      reqobj[item] = "[FILTERED]"
     }
  })
  return reqobj
 } 