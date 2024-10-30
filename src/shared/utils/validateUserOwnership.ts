import { ForbiddenException } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { EUserRole } from '../enums/user-role.enums';

type TValidateUserOwnership = (args: { activeUserId?: number; entity: { user: User } }) => void;

export const validateUserOwnership: TValidateUserOwnership = ({ activeUserId, entity }) => {
    if (typeof activeUserId !== 'number') {
        return;
    }

    if (entity.user.role === EUserRole.ADMIN) {
        return;
    }

    if (entity.user.id !== activeUserId) {
        throw new ForbiddenException();
    }
};