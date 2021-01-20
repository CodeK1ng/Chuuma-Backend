import { Controller, Get } from '@nestjs/common';
import { UnitPriceService } from './unit-price.service';

@Controller('unit-price')
export class UnitPriceController {

    constructor(private readonly unitPriceService: UnitPriceService){}

    @Get()
    fetchCurrentUnitPrice(){
        return this.unitPriceService.fetchUnitPrice();
    }
}
