import {  LogModel } from '../../models';
import {

} from '../../config/constants';
import { SequelizeProvider } from '../../common/providers/sequelize.provider';
import { CustomLogger } from '../../common/logger/logger.service';

export const LoggerProviders = [

  {
    provide: 'SEQUELIZE',
    useClass: SequelizeProvider,
  },
 
  {
    provide: 'Logger',
    useClass: CustomLogger,
  },
  {
    provide: 'LOGDB',
    useClass: LogModel,
  },
];
