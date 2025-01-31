import { applyDecorators } from '@nestjs/common';
import { Column } from 'typeorm';

interface ITwoDecimalsNumericColumnOptions {
    nullable?: boolean;
}

export default function TwoDecimalsNumericColumn(options?: ITwoDecimalsNumericColumnOptions) {
    const { nullable = false } = options || {};

    return applyDecorators(
        Column({
            nullable,
            type: 'numeric',
            precision: 10,
            scale: 2,
            transformer: { to: (value) => value, from: (value) => parseFloat(value) },
        }),
    );
}
