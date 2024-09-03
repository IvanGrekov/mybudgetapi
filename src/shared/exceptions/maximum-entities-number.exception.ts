import { HttpException, HttpStatus } from '@nestjs/common';

import { capitalize, addPluralSuffix } from '../utils/string.utils';
import { getIdPointer } from '../utils/idPointer.utils';

export default class MaximumEntitiesNumberException extends HttpException {
    constructor(userId: string | number, model: string) {
        const modelName = addPluralSuffix(capitalize(model));
        const message = `User ${getIdPointer(userId)} already has the maximum number of ${modelName}`;

        super(message, HttpStatus.FORBIDDEN);
    }
}
