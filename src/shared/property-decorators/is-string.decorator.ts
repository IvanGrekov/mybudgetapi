import { applyDecorators } from '@nestjs/common';

import {
  MinLength,
  MaxLength,
  IsString as IsStringBase,
} from 'class-validator';

import {
  DEFAULT_MIN_LENGTH,
  DEFAULT_MAX_LENGTH,
} from '../constants/string-fields.constants';

interface IIsStringOptions {
  minLength?: number;
  maxLength?: number;
}

export default function IsString(options?: IIsStringOptions) {
  const { minLength = DEFAULT_MIN_LENGTH, maxLength = DEFAULT_MAX_LENGTH } =
    options || {};

  return applyDecorators(
    IsStringBase(),
    MinLength(minLength),
    MaxLength(maxLength),
  );
}
