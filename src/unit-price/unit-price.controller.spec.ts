import { Test, TestingModule } from '@nestjs/testing';
import { UnitPriceController } from './unit-price.controller';

describe('UnitPriceController', () => {
  let controller: UnitPriceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitPriceController],
    }).compile();

    controller = module.get<UnitPriceController>(UnitPriceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
