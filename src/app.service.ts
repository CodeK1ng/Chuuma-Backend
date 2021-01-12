import { Injectable } from '@nestjs/common';
import { format, addDays, parse, toDate, parseISO } from 'date-fns'

@Injectable()
export class AppService {
  getHello() {
    const transactionDate: string = format(new Date(), 'yyyy-MM-dd HH:MM:SS');
    const some = parseISO(transactionDate);
    const tenure = 91;
    
    const maturityDate = addDays(some, tenure);

    console.log(maturityDate);

    return maturityDate;
    
  }
}
