import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/accounts.entity';
import { BalanceToWithdraw } from 'src/entities/balanceToWithdraw.entity';
import { Customer } from 'src/entities/customer.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { UnitPrice } from 'src/entities/unitPrices.entity';
import { AccountRepository } from 'src/repositories/accounts.repository';
import { BalanceToWithdrawRepository } from 'src/repositories/balanceToWidraw.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { ServiceRepository } from 'src/repositories/service.repository';
import { TransactionRepository } from 'src/repositories/transaction.repository';
import { UnitPricesRepository } from 'src/repositories/unitPrices.repository';
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
        private readonly accountRepository: AccountRepository,
        @InjectRepository(UnitPrice)
        private readonly unitPricesRepository: UnitPricesRepository
    ) { }

    async completeTransaction(payload) {
        console.log('PAYLOAD FROM CALLBACK ===============>>', payload.reference);

        let getTransaction = await this.transactionRepository.findOne({
            where: {
                externalTransactionID: payload.reference
            }
        });

        console.log('Transaction Fetched ==================>', getTransaction);

        if (payload.status == 'TXN_AUTH_SUCCESSFUL') {

            console.log('Transaction Successfull ==================>');
            getTransaction.status = 'Success';
            this.transactionRepository.save(getTransaction);

            const accountToUpdate = await this.accountRepository.findOne({
                where: {
                    msisdn: getTransaction.msisdn,
                    account_type_id: getTransaction.acountTypeId
                }
            });

            let todayUnitPriceList = await this.unitPricesRepository.find({
                order: {
                    created_at: 'DESC',
                },
                take: 1
            });

            let latestEntry = todayUnitPriceList[0]


            console.log(latestEntry);

            accountToUpdate.balance = accountToUpdate.balance + getTransaction.units;
            this.accountRepository.save(accountToUpdate);

            const message = "You are have invested K" + getTransaction.amount + " in Chuuma, your account balance is K " + accountToUpdate.balance * latestEntry.unitPrice + ".";
            const payload = {
                "originatorId": "Chuuma",
                "msisdn": getTransaction.msisdn,
                "text": message
            }
            await this.httpService.post<any>("http://41.175.8.68:8181/bulksms/sms/gariSms.php", payload)
                .toPromise()
                .then(async res => {
                    console.log(res.data);
                    return res.data;

                }).catch(err => {
                    return err;
                });

        } else {

            getTransaction.status = 'Failed';
            this.transactionRepository.save(getTransaction);

            const message = "Your attempt to invest in the Chuuma fund failed.";
            const payload = {
                "originatorId": "Chuuma",
                "msisdn": getTransaction.msisdn,
                "text": message
            }
            await this.httpService.post<any>("http://41.175.8.68:8181/bulksms/sms/gariSms.php", payload)
                .toPromise()
                .then(async res => {
                    console.log(res.data);
                    return res.data;

                }).catch(err => {
                    return err;
                });

        }



    }

}
