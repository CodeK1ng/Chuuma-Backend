import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/accounts.entity';
import { BalanceToWithdraw } from 'src/entities/balanceToWithdraw.entity';
import { Customer } from 'src/entities/customer.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { AccountRepository } from 'src/repositories/accounts.repository';
import { BalanceToWithdrawRepository } from 'src/repositories/balanceToWidraw.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { ServiceRepository } from 'src/repositories/service.repository';
import { TransactionRepository } from 'src/repositories/transaction.repository';
import { Transaction } from 'typeorm';

@Injectable()
export class CompleteTransactionService {

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

    async completeTransaction(payload){
        console.log('PAYLOAD FROM CALLBACK ===============>>',payload.reference);

        let getTransaction = await this.transactionRepository.findOne({
            where: {
                externalTransactionID: payload.reference
            }
        });
        
        console.log('Transaction Fetched ==================>',getTransaction);

        if(payload.status == 'TXN_AUTH_SUCCESSFUL'){

            console.log('Transaction Successfull ==================>');
            getTransaction.status = 'Success';
            this.transactionRepository.save(getTransaction);

            const accountToUpdate = await this.accountRepository.findOne({
                where: {
                    msisdn: getTransaction.msisdn,
                    account_type_id: getTransaction.acountTypeId
                }
            });

            accountToUpdate.balance = accountToUpdate.balance + getTransaction.units;
            this.accountRepository.save(accountToUpdate);

            const message = "You are have invested K" +getTransaction.amount+ " in Chuuma, your account balance is K " +accountToUpdate.balance+".";
            await this.httpService.get<any>("http://sms01.rubicube.org/bulksms/bulksms?username=simbani&password=simbani%40321&type=0&dlr=1&destination="+getTransaction.msisdn+"&source=Chuuma&message="+message)
                                                        .toPromise()
                                                        .then(async res => {
                                                            console.log(res.data);
                                                            
                                                        }).catch(err => {
                                                        
                                                        });
            
        }else{

            getTransaction.status = 'Failed';
            this.transactionRepository.save(getTransaction);

            const message = "Your attempt to invest in the Chuuma fund failed.";
            await this.httpService.get<any>("http://sms01.rubicube.org/bulksms/bulksms?username=simbani&password=simbani%40321&type=0&dlr=1&destination="+getTransaction.msisdn+"&source=Chuuma&message="+message)
                                                        .toPromise()
                                                        .then(async res => {
                                                            console.log(res.data);
                                                            
                                                        }).catch(err => {
                                                        
                                                        });

        }
        
        
        
    }

}
