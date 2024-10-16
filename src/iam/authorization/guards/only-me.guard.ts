import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ONLY_ME_KEY } from '../decorators/only-me.decorator';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { IActiveUser } from '../../interfaces/active-user-data.interface';
import { EUserRole } from '../../../shared/enums/user-role.enums';

@Injectable()
export class OnlyMeGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const contextOnlyMe = this.reflector.getAllAndOverride<boolean>(ONLY_ME_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!contextOnlyMe) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: IActiveUser = request[REQUEST_USER_KEY];
        const userId = user.sub;
        const idFromParams = Number(request.params?.id);
        const userIdFromBody = Number(request.body?.userId);
        const userRole = user.role;

        if (userRole === EUserRole.ADMIN) {
            return true;
        }

        if (idFromParams === userId) {
            return true;
        }

        if (userIdFromBody === userId) {
            return true;
        }

        if (!idFromParams && !userIdFromBody) {
            return true;
        }

        return false;
    }
}
