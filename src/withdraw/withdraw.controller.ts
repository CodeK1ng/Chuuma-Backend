import { Body, Controller, Post } from '@nestjs/common';
import { WithdrawDTO } from 'src/dto/withdraw.dto';
import { WithdrawService } from './withdraw.service';

@Controller('withdraw')
export class WithdrawController {
    constructor(private readonly withdrawService: WithdrawService){}

    @Post()
    withdrawRequest(@Body() payload: WithdrawDTO){
        return this.withdrawService.withdrawRequest(payload);
    }
}
