import { Body, Controller, Post } from '@nestjs/common';
import { MatureTransactionsDTO } from 'src/dto/mature_transaction.dto';
import { MatureTransactionsService } from './mature-transactions.service';

@Controller('mature-transactions')
export class MatureTransactionsController {
    constructor(
        private readonly matureTransactionsService: MatureTransactionsService
    ) { }

    @Post()
    generalPlan(@Body() payload: MatureTransactionsDTO) {
        return this.matureTransactionsService.matureTransactions(payload);
    }
}
