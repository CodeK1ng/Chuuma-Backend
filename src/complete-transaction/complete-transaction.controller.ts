import { Body, Controller, Post } from '@nestjs/common';
import { CompleteTransactionService } from './complete-transaction.service';

@Controller('complete-transaction')
export class CompleteTransactionController {

    constructor(private readonly completeTransactionService: CompleteTransactionService){}

    @Post()
    completeTransaction(@Body() payload){
        console.log(payload);
        
        return this.completeTransactionService.completeTransaction(payload);
    }

}
