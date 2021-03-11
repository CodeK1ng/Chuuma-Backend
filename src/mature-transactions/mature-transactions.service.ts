import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatureTransactionsDTO } from 'src/dto/mature_transaction.dto';
import { Account } from 'src/entities/accounts.entity';
import { BalanceToWithdraw } from 'src/entities/balanceToWithdraw.entity';
import { Customer } from 'src/entities/customer.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { UnitPrice } from 'src/entities/unitPrices.entity';
import { AccountRepository } from 'src/repositories/accounts.repository';
import { BalanceToWithdrawRepository } from 'src/repositories/balanceToWidraw.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { ServiceRepository } from 'src/repositories/service.repository';
import { TransactionRepository } from 'src/repositories/transaction.repository';
import { UnitPricesRepository } from 'src/repositories/unitPrices.repository';
import { LessThanOrEqual } from 'typeorm';
import { format } from 'date-fns'

@Injectable()
export class MatureTransactionsService {
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
        private readonly unitPricesRepository: UnitPricesRepository,
    ) { }


    async matureTransactions(payload: MatureTransactionsDTO) {
        console.log(payload);

        let todayUnitPriceList = await this.unitPricesRepository.find({
            order: {
                created_at: 'DESC',
            },
            take: 1
        });

        let latestEntry = todayUnitPriceList[0]


        console.log(latestEntry);

        const curDate = format(new Date(), 'yyyy-MM-dd H:mm:ss');

        console.log(curDate);

        const transactionsToMature: Transaction[] = await this.transactionRepository.find({
            serviceId: payload.serviceId,
            tenure: payload.tenure,
            status: "Success",
            maturityDate: LessThanOrEqual(curDate)
        });

        const totalUnitsMatured = transactionsToMature.reduce((sum, trans) => sum + trans.units, 0);

        console.log(totalUnitsMatured);

        const response = await this.transactionRepository.update({
            serviceId: payload.serviceId,
            tenure: payload.tenure,
            status: "Success",
            maturityDate: LessThanOrEqual(curDate)
        }, { movedToWithdraws: 1, maturity_unit_price: latestEntry.unitPrice });

        console.log(response);



        if (response.raw.affectedRows > 0 && response.raw.changedRows > 0) {
            console.log('==========Maturies=============');

            const balanceToUpdate = await this.balanceToWithdrawRepository.findOne({
                where: {
                    msisdn: payload.msisdn,
                    account_type_id: payload.productId
                }
            });

            balanceToUpdate.balance = balanceToUpdate.balance + totalUnitsMatured;
            await this.balanceToWithdrawRepository.save(balanceToUpdate);

        } else {
            console.log('No maturities');
        }


    }
}
