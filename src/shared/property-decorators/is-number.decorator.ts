import { applyDecorators } from '@nestjs/common';

import { IsNumber as IsNumberBase, Min, Max } from 'class-validator';

import { DEFAULT_MIN, DEFAULT_MAX } from 'shared/constants/number-fields.constants';

interface IIsNumberOptions {
    min?: number;
    max?: number;
}

export default function IsNumber(options?: IIsNumberOptions) {
    const { min = DEFAULT_MIN, max = DEFAULT_MAX } = options || {};

    return applyDecorators(IsNumberBase(), Min(min), Max(max));
}
