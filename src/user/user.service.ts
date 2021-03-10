import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/accounts.entity';
import { BalanceToWithdraw } from 'src/entities/balanceToWithdraw.entity';
import { Customer } from 'src/entities/customer.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { AccountRepository } from 'src/repositories/accounts.repository';
import { BalanceToWithdrawRepository } from 'src/repositories/balanceToWidraw.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { ServiceRepository } from 'src/repositories/service.repository';
import { TransactionRepository } from 'src/repositories/transaction.repository';
import { format, addDays, parseISO } from 'date-fns'
import { MoreThan, MoreThanOrEqual } from 'typeorm';


@Injectable()
export class UserService {

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Customer)
        private readonly customerRepository: CustomerRepository,
        @InjectRepository(Transaction)
        private readonly transactionRepository: TransactionRepository,
        @InjectRepository(BalanceToWithdraw)
        private readonly balanceToWithdrawRepository: BalanceToWithdrawRepository,
        @InjectRepository(Service)
        private readonly serivceRepository: ServiceRepository,
        @InjectRepository(Product)
        private readonly productRepository: ProductRepository,
        @InjectRepository(Account)
        private readonly accountRepository: AccountRepository
        ){}


        async findByMsisdn(msisdn: string): Promise<Customer> {
            return await this.customerRepository.findOne({
                where: {
                    msisdn: msisdn
                },
                relations: ['accounts','balanceToWithdraw']
            });
          }


        async fetchUserStatement(msisdn: string): Promise<Transaction[]>{
            return await this.transactionRepository.find({
                where: {
                    msisdn: msisdn
                },
                order: {
                    created_at: 'DESC'
                },
                take: 10
            })
        }

        async fetchUserMaturities(msisdn: string): Promise<Transaction[]>{

            const curDate = format(new Date(), 'yyyy-MM-dd H:mm:ss');

            return await this.transactionRepository.find({
                where: {
                    msisdn: msisdn,
                    status: "Success",
                    maturityDate: MoreThan(curDate)
                },
                order: {
                    maturityDate: 'ASC'
                }
            })
        }


        sendSMS(msisdn: string, message: string){
            return this.httpService.get<any>("http://sms01.rubicube.org/bulksms/bulksms?username=simbani&password=simbani%40321&type=0&dlr=1&destination="+msisdn+"&source=Chuuma&message="+message)
            .toPromise()
            .then(async res => {
                console.log(res.data);
                return res.data;
                
            }).catch(err => {
                return err;
            });
        }
}
