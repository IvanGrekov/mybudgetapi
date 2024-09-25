import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { USER_ROLE_KEY } from '../decorators/user-role.decorator';
import { EUserRole } from '../../../shared/enums/user-role.enums';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { IActiveUser } from '../../interfaces/active-user-data.interface';

@Injectable()
export class UserRoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const contextRoles = this.reflector.getAllAndOverride<EUserRole[]>(USER_ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!contextRoles?.length) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: IActiveUser = request[REQUEST_USER_KEY];
        const userRole = user.role;

        if (userRole === EUserRole.ADMIN) {
            return true;
        }

        return contextRoles.includes(user.role);
    }
}
