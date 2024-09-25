import { SetMetadata } from '@nestjs/common';

import { EUserRole } from '../../../shared/enums/user-role.enums';

export const USER_ROLE_KEY = 'userRole';

export const UserRole = (...userRoles: EUserRole[]) => SetMetadata(USER_ROLE_KEY, userRoles);
