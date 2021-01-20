import { Body, Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}


    @Get(':msisdn')
    fetchUserData(@Param('msisdn') msisdn: string){
        return this.userService.findByMsisdn(msisdn);
    }

    @Get('statement/:msisdn')
    fetchUserStatements(@Param('msisdn') msisdn: string){
        return this.userService.fetchUserStatement(msisdn);
    }
}
