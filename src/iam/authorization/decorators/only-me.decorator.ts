import { SetMetadata } from '@nestjs/common';

export const ONLY_ME_KEY = 'onlyMe';

export const OnlyMe = (value = true) => SetMetadata(ONLY_ME_KEY, value);
