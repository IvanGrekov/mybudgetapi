import { applyDecorators } from '@nestjs/common';

import { IsString as IsStringBase, MinLength, MaxLength } from 'class-validator';

import { DEFAULT_MIN_LENGTH, DEFAULT_MAX_LENGTH } from 'shared/constants/string-fields.constants';

interface IIsStringOptions {
    minLength?: number;
    maxLength?: number;
}

export default function IsString(options?: IIsStringOptions) {
    const { minLength = DEFAULT_MIN_LENGTH, maxLength = DEFAULT_MAX_LENGTH } = options || {};

    return applyDecorators(IsStringBase(), MinLength(minLength), MaxLength(maxLength));
}
