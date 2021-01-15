import { HttpModule, Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/accounts.entity';
import { User } from 'src/entities/user.entity';
import { AccountRepository } from 'src/repositories/accounts.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { BalanceToWithdrawRepository } from 'src/repositories/balanceToWidraw.repository';
import { Transaction } from 'src/entities/transaction.entity';
import { BalanceToWithdraw } from 'src/entities/balanceToWithdraw.entity';
import { TransactionRepository } from 'src/repositories/transaction.repository';
import { Service } from 'src/entities/service.entity';
import { Product } from 'src/entities/product.entity';
import { ProductRepository } from 'src/repositories/product.repository';
import { ServiceRepository } from 'src/repositories/service.repository';

@Module({
  providers: [InvestmentService],
  controllers: [InvestmentController],
  imports: [
    HttpModule.register({
      timeout: 50000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([User, Account, User, Transaction, BalanceToWithdraw, Product, Service, ProductRepository, ServiceRepository, CustomerRepository, AccountRepository, UserRepository, TransactionRepository, BalanceToWithdrawRepository ])
  ],
})
export class InvestmentModule {}
