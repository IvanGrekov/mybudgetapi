import { HttpException, HttpStatus } from '@nestjs/common';

import { capitalize } from '../utils/string.utils';
import { getIdPointer } from '../utils/idPointer.utils';

export default class NotFoundException extends HttpException {
    constructor(model: string, id?: string | number) {
        const idPointer = id ? `${getIdPointer(id)} ` : '';
        const message = `${capitalize(model)} ${idPointer}not found`;

        super(message, HttpStatus.NOT_FOUND);
    }
}
