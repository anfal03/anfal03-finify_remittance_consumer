import { AgentModel, AgentPorfileModel, JsonrxModel } from '../../models';
import {
  AGENTPROFILE_REPOSITORY,
  TRANSACTION_REPOSITORY,
  JSONRX_REPOSITORY,
} from '../../config/constants';

export const userProviders = [
  {
    provide: AGENTPROFILE_REPOSITORY,
    useValue: AgentPorfileModel,
  },
  {
    provide: TRANSACTION_REPOSITORY,
    useValue: AgentModel,
  },

  {
    provide: JSONRX_REPOSITORY,
    useValue: JsonrxModel,
  },
];
