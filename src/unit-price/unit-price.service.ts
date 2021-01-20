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
export class UnitPriceService {

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Customer)
        private readonly customerRepository: CustomerRepository,
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
        ){}


        async fetchUnitPrice(){
            let todayUnitPriceList = await this.unitPricesRepository.find({
            order: {
                created_at: 'DESC',
            },
            take: 1
            });

            let latestEntry = todayUnitPriceList[0]


            console.log(latestEntry);

            return latestEntry;
        }

        
}
