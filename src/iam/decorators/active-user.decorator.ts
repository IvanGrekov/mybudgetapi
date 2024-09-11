import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { REQUEST_USER_KEY } from '../iam.constants';
import { IActiveUser } from '../interfaces/active-user-data.interface';

export const ActiveUser = createParamDecorator(
    (
        field: keyof IActiveUser | undefined,
        ctx: ExecutionContext,
    ): IActiveUser | string | number => {
        const request = ctx.switchToHttp().getRequest();
        const user: IActiveUser = request[REQUEST_USER_KEY];

        return field ? user?.[field] : user;
    },
);
