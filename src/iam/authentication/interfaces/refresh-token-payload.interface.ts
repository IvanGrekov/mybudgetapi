import { IActiveUser } from '../../interfaces/active-user-data.interface';

export interface IRefreshTokenPayload extends IActiveUser {
    refreshTokenId: string;
}
