import { Body, Controller, Post } from '@nestjs/common';
import { SignInDTO } from 'src/dto/sing_in.dto';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    
    constructor(private  readonly  authService:  AuthService) {}

    @Post('signin')
    async login(@Body() user: SignInDTO): Promise<any> {
        console.log("Login Controller",user);
      return this.authService.login(user);
    }  

}