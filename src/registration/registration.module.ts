import { HttpModule, Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { Account } from 'src/entities/accounts.entity';
import { AccountRepository } from 'src/repositories/accounts.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { TransactionRepository } from 'src/repositories/transaction.repository';
import { Transaction } from 'src/entities/transaction.entity';
import { BalanceToWithdraw } from 'src/entities/balanceToWithdraw.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { BalanceToWithdrawRepository } from 'src/repositories/balanceToWidraw.repository';
import { ProductRepository } from 'src/repositories/product.repository';
import { ServiceRepository } from 'src/repositories/service.repository';

@Module({
  providers: [RegistrationService],
  controllers: [RegistrationController],
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([User, Account, User, Transaction, BalanceToWithdraw, Product, Service, ProductRepository, ServiceRepository, CustomerRepository, AccountRepository, UserRepository, TransactionRepository, BalanceToWithdrawRepository])
  ],
})
export class RegistrationModule {}
