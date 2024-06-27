

import { Inject } from '@nestjs/common';
import { error } from 'console';
import { LOGDB } from 'src/config/constants';
import { LogModel } from 'src/models';
import Transport from 'winston-transport';

class PostgresTransport extends Transport {
  constructor(@Inject(LOGDB) private logRepo: typeof LogModel) {
    super();
  }
  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    this.logRepo
      .create({
        level: info.level,
        message: info.message,
        appname: process.env.LOGAPPNAME,
      })
      .then(() => callback())
      .catch((error) => {
        console.error('LOG SQL ERROR ', error);
        callback();
      });
    // Perform the writing to the remote service
  }
}
export default PostgresTransport;
