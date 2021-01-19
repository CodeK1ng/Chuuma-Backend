import { HttpException, HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { PAYMENT_URL } from 'src/app-config';
import { WithdrawDTO } from 'src/dto/withdraw.dto';
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
import { SuccessResponse } from 'src/responses/success.response';
import { UserService } from 'src/user/user.service';
import { Equal } from 'typeorm';

@Injectable()
export class WithdrawService {

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
        private readonly accountRepository: AccountRepository,
        private readonly userService: UserService
        ){}

        customerAccount: Account;

        async withdrawRequest(payload: WithdrawDTO){
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
    
            if(this.customerAccount.balance >= payload.amount && customer.balanceToWithdraw.find(acc => acc.account_type_id == payload.productId).balance >= payload.amount){
                let transaction = new Transaction();
    
            transaction.acountTypeId = payload.productId;
            transaction.amount = payload.amount;
            transaction.msisdn = payload.msisdn;
            transaction.created_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');
            transaction.maturityDate = format(new Date(), 'yyyy-MM-dd HH:MM:SS');
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
    
            const withdrawPayload = {
                "amount": createdTransaction.amount,
                "customerEmail": '',
                "customerFirstName": customer.firstName,
                "customerLastName": customer.lastName,
                "customerPhone": customer.msisdn,
                "wallet": customer.msisdn
            }
    
            return this.httpService.post(PAYMENT_URL+'/credit', withdrawPayload)
            .toPromise()
            .then( async (response) => {
                console.log(response);
                
                const res = new SuccessResponse();
                    res.status = HttpStatus.OK;
                    res.message = 'Transaction was successful';
                    res.body = response.data;
                
                    let transactionToUpdate = await this.transactionRepository.findOne({
                        where: {
                            id: Equal(createdTransaction.id)
                        }
                    });

                if(response.data.status == 'TXN_SUCCESSFUL'){
                   
    
                     transactionToUpdate.externalTransactionID = response.data.reference;
                     transactionToUpdate.status = 'Success';
                     transactionToUpdate.balance = this.customerAccount.balance - transactionToUpdate.units;
                     
                     await this.transactionRepository.save(transactionToUpdate);

                     this.customerAccount.balance = this.customerAccount.balance - transactionToUpdate.units;
                     await this.accountRepository.save(this.customerAccount);

                     const message = "You have withdrawn K"+transactionToUpdate.amount+" from the Chuuma fund. Your account balance is K"+this.customerAccount.balance;
                     await this.userService.sendSMS(transactionToUpdate.msisdn, message);
    
                    return  res;

                }else{
                    transactionToUpdate.status = 'Failed';
                    this.transactionRepository.save(transactionToUpdate);
        
                    const message = "Your attempt to withdraw from the Chuuma fund failed.";
                    await this.userService.sendSMS(transactionToUpdate.msisdn, message);

                    throw new HttpException('Could not complete transaction, Please try again after some time.', HttpStatus.BAD_REQUEST); 
                    
                }
                }).catch(err => {
                    throw new HttpException('Could not complete transaction, Please try again after some time.', HttpStatus.BAD_REQUEST);
                    
                })
            }else{
                throw new HttpException('You have insuffienct balance.', HttpStatus.BAD_REQUEST);
            }
    
            
        }

}
