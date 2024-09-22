import { IsEnum } from 'class-validator';

import { EUserRole } from '../../shared/enums/user-role.enums';

export class EditUserRoleDto {
    @IsEnum(EUserRole)
    readonly userRole: EUserRole;
}
