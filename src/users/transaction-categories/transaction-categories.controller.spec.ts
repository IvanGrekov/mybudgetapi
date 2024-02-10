import { Test, TestingModule } from '@nestjs/testing';
import { TransactionCategoriesController } from './transaction-categories.controller';

describe('TransactionCategoriesController', () => {
  let controller: TransactionCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionCategoriesController],
    }).compile();

    controller = module.get<TransactionCategoriesController>(TransactionCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
