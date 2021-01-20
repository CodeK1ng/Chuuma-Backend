import { Test, TestingModule } from '@nestjs/testing';
import { UnitPriceService } from './unit-price.service';

describe('UnitPriceService', () => {
  let service: UnitPriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitPriceService],
    }).compile();

    service = module.get<UnitPriceService>(UnitPriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
