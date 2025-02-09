import { BadRequestException } from '@nestjs/common';

export const validateNewToIOweAccountBalance = (newToAccountBalance: number): void => {
    if (newToAccountBalance < 0) {
        throw new BadRequestException("You can't make over deposit to `I_OWE` Account");
    }
};
