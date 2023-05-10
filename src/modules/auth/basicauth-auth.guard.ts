import {
  ExecutionContext,
  Injectable,
  CanActivate,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonrxModel } from '../../models';
import { JSONRX_REPOSITORY, DATABASE_CONNECTION } from '../../config/constants';
import { Sequelize } from 'sequelize-typescript';
import { winstonLog } from '../../config/winstonLog';
@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') implements CanActivate {
  constructor(
    @Inject(JSONRX_REPOSITORY)
    private readonly userRepository: typeof JsonrxModel,
    @Inject(DATABASE_CONNECTION) private DB: Sequelize,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /*  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);*/
    const request = context.switchToHttp().getRequest();

    const basicValue = request.headers.authorization;
    winstonLog.log('info', 'Authorization: %s', basicValue);
    //   request.basicValue = basicValue;
    //   return this.canActivate(context);

    const payload = JSON.parse(
      JSON.stringify(
        await JsonrxModel.findAll({
          where: { ACCESS_TOKEN: basicValue },
        }),
      ),
    );
    winstonLog.log('info', 'Authorization: %s', payload[0]);
    if (payload[0].MSISDN != null) return true;
    else return false;
  }
 
}
