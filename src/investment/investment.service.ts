import { HttpService, HttpStatus, Injectable } from '@nestjs/common';
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
            let res = new ErrorResponse();

            res.status = HttpStatus.BAD_REQUEST;
            res.message = 'Could not complete transaction';
            res.error = 'User not found!'

            return res;
        }

        this.customerAccount = await this.accountRepository.findOne({
            where: {
                msisdn : payload.msisdn
            }
        });


        let creatAcc = new Account();

        creatAcc.account_type_id = payload.productId;
        creatAcc.balance = 0;
        creatAcc.customer = customer;
        creatAcc.msisdn = customer.msisdn;
        creatAcc.created_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');
        creatAcc.updated_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');

        if(!this.customerAccount){
            await this.accountRepository.save(creatAcc);
            customer.accounts.push(creatAcc)
            await this.customerRepository.save(customer);
        }else{
        }

        const balanceToWith = await this.balanceToWithdrawRepository.findOne({
            where: {
                msisdn : Equal(payload.msisdn)
            }
        });

        let balanceToWithAcc = new BalanceToWithdraw();

        balanceToWithAcc.account_type_id = payload.productId;
        balanceToWithAcc.balance = 0;
        balanceToWithAcc.customer = customer;
        balanceToWithAcc.msisdn = customer.msisdn;
        balanceToWithAcc.created_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');
        balanceToWithAcc.updated_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');

        if(!balanceToWith){
            await this.balanceToWithdrawRepository.save(balanceToWithAcc);
            customer.balanceToWithdraw.push(balanceToWithAcc)
            await this.customerRepository.save(customer);
        }else{

        }
        
        

        let transaction = new Transaction();

        transaction.acountTypeId = payload.productId;
        transaction.amount = payload.amount;
        transaction.tenure = payload.tenure;
        transaction.msisdn = payload.msisdn;
        transaction.created_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');

        const matuDate = this.getMaturityDate(payload.tenure, transaction.created_at);
        console.log(matuDate);
        
        transaction.maturityDate = matuDate.toString();
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

        return this.httpService.post(PAYMENT_URL, paymentPayload)
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

                 transactionToUpdate.externalTransactionID = response.data.transactionReference;
                 await this.transactionRepository.save(transactionToUpdate);

                return  res;
            }else{
               
                let res = new ErrorResponse();

                res.status = HttpStatus.SERVICE_UNAVAILABLE;
                res.message = 'Could not complete transaction';
                res.error = 'Request failed with status code 503!'

                return res;
                
            }
        }).catch(err => {
            console.log(err);
            let res = new ErrorResponse();

            res.status = HttpStatus.SERVICE_UNAVAILABLE;
            res.message = 'Could not complete transaction';
            res.error = 'Request failed with status code 503!'

            return res;
            
        })
    }


    

    
}
