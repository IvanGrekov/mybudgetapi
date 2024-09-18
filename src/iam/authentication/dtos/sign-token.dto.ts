export class SignTokenDto<T> {
    payload: T;
    expiresIn: number;
}
