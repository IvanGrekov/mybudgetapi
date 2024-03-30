import { HttpException, HttpStatus } from '@nestjs/common';

import { capitalize } from '../utils/string.utils';

export default class NotFoundException extends HttpException {
    constructor(model: string, id?: string | number) {
        const idPointer = id ? `#${id} ` : '';
        const message = `${capitalize(model)} ${idPointer}not found`;

        super(message, HttpStatus.NOT_FOUND);
    }
}
