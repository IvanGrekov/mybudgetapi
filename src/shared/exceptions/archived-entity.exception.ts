import { HttpException, HttpStatus } from '@nestjs/common';

import { capitalize } from 'shared/utils/string.utils';
import { getIdPointer } from 'shared/utils/idPointer.utils';

export default class ArchivedEntityException extends HttpException {
    constructor(model: string, id?: string | number) {
        const idPointer = id ? `${getIdPointer(id)} ` : '';
        const message = `${capitalize(model)} ${idPointer}is archived`;

        super(message, HttpStatus.BAD_REQUEST);
    }
}
