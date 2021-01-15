import { HttpException, HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PAYMENT_URL } from 'src/app-config';
import { InvetsDTO } from 'src/dto/invest.dto';
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
import { ErrorResponse, SuccessResponse } from 'src/responses/success.response';
import { format, addDays, parseISO } from 'date-fns'
import { Equal } from 'typeorm';

@Injectable()
export class InvestmentService {
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

    getMaturityDate(tenure: number, transactionDate){
        const date = parseISO(transactionDate);
        const maturityDate = addDays(date, tenure);
        return maturityDate;
        }

    customerAccount: Account;

    async generalInvestment(payload: InvetsDTO){
        console.log(payload);
        
        const customer = await this.customerRepository.findOne({
            where: {
              msisdn: payload.msisdn,
            },
            relations: ['transaction','accounts','balanceToWithdraw'],
          });

        console.log(customer);

        if(!customer){
            throw new HttpException('User not found!.', HttpStatus.BAD_REQUEST); 
        }

        this.customerAccount = await this.accountRepository.findOne({
            where: {
                msisdn : payload.msisdn
            }
        });

        

        let transaction = new Transaction();

        transaction.acountTypeId = payload.productId;
        transaction.amount = payload.amount;
        transaction.tenure = payload.tenure;
        transaction.msisdn = payload.msisdn;
        transaction.created_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');

        const matuDate = this.getMaturityDate(payload.tenure, transaction.created_at);
        console.log(matuDate);
        const md = format(matuDate, 'yyyy-MM-dd HH:MM:SS');

        transaction.maturityDate = md;
        transaction.serviceId = payload.serviceId;
        transaction.status = 'Pending';
        transaction.unitPrice = 1.0000;
        transaction.units = 1.0000;
        transaction.updated_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');
        transaction.movedToWithdraws = 0;
        transaction.maturity_unit_price = 0;
        transaction.balance = 0

        const createdTransaction = await this.transactionRepository.save(transaction);
        customer.transaction.push(createdTransaction);
        await this.customerRepository.save(customer);

        const paymentPayload = {
            "amount": createdTransaction.amount,
            "customerEmail": '',
            "customerFirstName": customer.firstName,
            "customerLastName": customer.lastName,
            "customerPhone": customer.msisdn,
            "wallet": customer.msisdn
        }

        return this.httpService.post(PAYMENT_URL+'/debit', paymentPayload)
        .toPromise()
        .then( async (response) => {
            console.log(response);
            
            const res = new SuccessResponse();
                res.status = HttpStatus.OK;
                res.message = 'PENDING_APPROVAL';
                res.body = response.data;
                
            if(response.data.status == 'TXN_AUTH_PENDING'){
                let transactionToUpdate = await this.transactionRepository.findOne({
                    where: {
                        id: Equal(createdTransaction.id)
                    }
                });

                 transactionToUpdate.externalTransactionID = response.data.reference;
                 await this.transactionRepository.save(transactionToUpdate);

                return  res;
            }else{
               
                throw new HttpException('Could not complete transaction, Please try again after some time.', HttpStatus.BAD_REQUEST); 
                
            }
        }).catch(err => {
            

            throw new HttpException('Could not complete transaction, Please try again after some time.', HttpStatus.BAD_REQUEST);
            
        })
    }


    

    
}
