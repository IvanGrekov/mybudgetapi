import { SetMetadata } from '@nestjs/common';

export const ONLY_ME_KEY = 'onlyMe';

export interface IOnlyMeArgs {
    isEnabled: boolean;
    queryParamsKey: string;
    paramsKey: string;
    bodyKey: string;
}

export const OnlyMe = (args?: Partial<IOnlyMeArgs>) => {
    const {
        isEnabled = true,
        queryParamsKey = 'userId',
        paramsKey = 'userId',
        bodyKey = 'userId',
    } = args || {};

    return SetMetadata<string, IOnlyMeArgs>(ONLY_ME_KEY, {
        isEnabled,
        queryParamsKey,
        paramsKey,
        bodyKey,
    });
};
