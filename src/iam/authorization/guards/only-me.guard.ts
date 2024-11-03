import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { EUserRole } from 'shared/enums/user-role.enums';

import { REQUEST_USER_KEY } from 'iam/iam.constants';
import { IActiveUser } from 'iam/interfaces/active-user-data.interface';

import { IOnlyMeArgs, ONLY_ME_KEY } from 'iam/authorization/decorators/only-me.decorator';

@Injectable()
export class OnlyMeGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const contextOnlyMe = this.reflector.getAllAndOverride<IOnlyMeArgs>(ONLY_ME_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!contextOnlyMe || !contextOnlyMe.isEnabled) {
            return true;
        }

        const { paramsKey, bodyKey } = contextOnlyMe;
        const request = context.switchToHttp().getRequest();

        const user: IActiveUser = request[REQUEST_USER_KEY];
        const userId = user.sub;
        const userRole = user.role;

        if (userRole === EUserRole.ADMIN) {
            return true;
        }

        const userIdFromQueryParams = Number(request.query?.[paramsKey]);
        const userIdFromParams = Number(request.params?.[paramsKey]);
        const userIdFromBody = Number(request.body?.[bodyKey]);

        if (!userIdFromQueryParams && !userIdFromParams && !userIdFromBody) {
            return true;
        }

        if (userIdFromQueryParams === userId) {
            return true;
        }

        if (userIdFromParams === userId) {
            return true;
        }

        if (userIdFromBody === userId) {
            return true;
        }

        return false;
    }
}
