import { Body, Controller, Post } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller('registration')
export class RegistrationController {

    constructor(private readonly registrationService: RegistrationService){}

    @Post()
    fetchCustomerDetails(@Body() payload){
        console.log('Registration Payload ======>>>',payload);
        
        return this.registrationService.registerClient(payload);
    }
}
