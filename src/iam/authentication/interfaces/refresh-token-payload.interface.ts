import { IActiveUser } from 'src/iam/interfaces/active-user-data.interface';

export interface IRefreshTokenPayload extends IActiveUser {
    refreshTokenId: string;
}