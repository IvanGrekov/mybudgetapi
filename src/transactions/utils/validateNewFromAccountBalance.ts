import { BadRequestException } from '@nestjs/common';

export const validateNewFromAccountBalance = (newFromAccountBalance: number): void => {
    if (newFromAccountBalance < 0) {
        throw new BadRequestException('The `fromAccount` balance is insufficient');
    }
};
