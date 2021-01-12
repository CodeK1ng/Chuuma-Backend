import { Body, Controller, Post } from '@nestjs/common';
import { InvetsDTO } from 'src/dto/invest.dto';
import { Product } from 'src/entities/product.entity';
import { InvestmentService } from './investment.service';

@Controller('invest')
export class InvestmentController {
    constructor(private readonly investmentService: InvestmentService){}

    @Post('general-plan')
    generalPlan(@Body() payload: InvetsDTO){
        return this.investmentService.generalInvestment(payload);
    }

    @Post('complete-transaction')
    completeTransaction(@Body() payload){
        return this.investmentService.completeTransaction(payload);
    }
}
