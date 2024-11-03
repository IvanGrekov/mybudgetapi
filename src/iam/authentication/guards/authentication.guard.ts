import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AUTH_TYPE_KEY } from 'iam/authentication/decorators/auth.decorator';
import { EAuthType } from 'iam/authentication/enums/auth-type.enum';
import { AccessTokenGuard } from 'iam/authentication/guards/access-token.guard';
import { ApiKeyGuard } from 'iam/authentication/guards/api-key.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly accessTokenGuard: AccessTokenGuard,
        private readonly apiKeyGuard: ApiKeyGuard,
    ) {}

    private static readonly defaultAuthType = EAuthType.Bearer;
    private readonly authTypeGuardMap: Record<EAuthType, CanActivate | CanActivate[]> = {
        [EAuthType.Bearer]: this.accessTokenGuard,
        [EAuthType.ApiKey]: this.apiKeyGuard,
        [EAuthType.None]: {
            canActivate: () => true,
        },
    };

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authTypes = this.reflector.getAllAndOverride<EAuthType[]>(AUTH_TYPE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? [AuthenticationGuard.defaultAuthType];
        const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
        let error = new UnauthorizedException();

        for (const instance of guards) {
            const canActivate = await Promise.resolve(instance.canActivate(context)).catch(
                (err) => {
                    error = err;
                },
            );

            if (canActivate) {
                return true;
            }
        }
        throw error;
    }
}
