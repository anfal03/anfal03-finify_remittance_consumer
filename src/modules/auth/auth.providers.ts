import { JsonrxModel } from '../../models';
import { JSONRX_REPOSITORY } from '../../config/constants';

export const authProviders = [
  {
    provide: JSONRX_REPOSITORY,
    useValue: JsonrxModel,
  },
];
