import { HttpModule, Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { Account } from 'src/entities/accounts.entity';
import { AccountRepository } from 'src/repositories/accounts.repository';
import { UserRepository } from 'src/repositories/user.repository';

@Module({
  providers: [RegistrationService],
  controllers: [RegistrationController],
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([User, Account, User, CustomerRepository, AccountRepository, UserRepository])
  ],
})
export class RegistrationModule {}
