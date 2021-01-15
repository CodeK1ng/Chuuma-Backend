import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Account } from './entities/accounts.entity';
import { BalanceToWithdraw } from './entities/balanceToWithdraw.entity';
import { Customer } from './entities/customer.entity';
import { Transaction } from './entities/transaction.entity';
import { UnitPrice } from './entities/unitPrices.entity';
import { User } from './entities/user.entity';
import { RegistrationModule } from './registration/registration.module';
import { GeneralInvestmentModule } from './general-investment/general-investment.module';
import { InvestmentModule } from './investment/investment.module';
import { Product } from './entities/product.entity';
import { Service } from './entities/service.entity';
import { CompleteTransactionModule } from './complete-transaction/complete-transaction.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WithdrawModule } from './withdraw/withdraw.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    // host: 'localhost',
    // port: 3306,
    // username: 'root',
    // password: '',
    host: '41.175.8.68',
      port: 9133,
      username: 'admin',
      password: 'H0bb170n@2020',
    database: 'chuuma',
    entities: [User, Customer, Transaction, Account, BalanceToWithdraw, UnitPrice, Product, Service,],
    synchronize: true,
    logging: true
  }),
  RegistrationModule,
  GeneralInvestmentModule,
  InvestmentModule,
  CompleteTransactionModule,
  AuthModule,
  UserModule,
  WithdrawModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
