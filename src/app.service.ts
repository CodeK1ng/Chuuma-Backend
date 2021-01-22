import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
   
   const hello = 'Hello Welcome to the chuuma api!!!';
   return hello;
    
  }
}
