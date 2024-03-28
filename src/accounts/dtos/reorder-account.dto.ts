import IsNumber from '../../shared/property-decorators/is-number.decorator';

export class ReorderAccountDto {
  @IsNumber()
  readonly order: number;
}
