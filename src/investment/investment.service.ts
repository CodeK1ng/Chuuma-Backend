import { HttpException, HttpService, HttpStatus, Injectable } from '@nestjs/common';
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
import { UnitPrice } from 'src/entities/unitPrices.entity';
import { UnitPricesRepository } from 'src/repositories/unitPrices.repository';

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
        private readonly accountRepository: AccountRepository,
        @InjectRepository(UnitPrice)
        private readonly unitPricesRepository: UnitPricesRepository
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
            throw new HttpException('User not found!.', HttpStatus.BAD_REQUEST); 
        }

        this.customerAccount = await this.accountRepository.findOne({
            where: {
                msisdn : payload.msisdn
            }
        });

        console.log("================================================================");
        
        const curDate = format(new Date(), 'yyyy-MM-dd H:mm:ss');

        console.log(curDate);

        let todayUnitPriceList = await this.unitPricesRepository.find({
            order: {
                created_at: 'DESC',
            },
            take: 1
        });

        let latestEntry = todayUnitPriceList[0]


        console.log(latestEntry);
        

        let calculatedUnits = Math.round((payload.amount/latestEntry.unitPrice) * 1000000)/ 1000000;
        
        
        let transaction = new Transaction();

        transaction.acountTypeId = payload.productId;
        transaction.amount = payload.amount;
        transaction.tenure = payload.tenure;
        transaction.msisdn = payload.msisdn;
        transaction.created_at = curDate;

        const matuDate = this.getMaturityDate(payload.tenure, curDate);
        // console.log(matuDate);
        const md = format(matuDate, 'yyyy-MM-dd H:mm:ss');
        console.log(md);
        transaction.maturityDate = md;
        transaction.serviceId = payload.serviceId;
        transaction.status = 'Pending';
        transaction.unitPrice = latestEntry.unitPrice;
        transaction.units = calculatedUnits;
        transaction.updated_at = format(new Date(), 'yyyy-MM-dd H:mm:ss');
        transaction.movedToWithdraws = 0;
        transaction.maturity_unit_price = 0;
        transaction.balance = 0

        console.log("========================Transaction to be written==========================");
        console.log(transaction);
        
        

        const createdTransaction = await this.transactionRepository.save(transaction);
        customer.transaction.push(createdTransaction);
        await this.customerRepository.save(customer);

        const paymentPayload = {
            "amount": createdTransaction.amount,
            "customerEmail": '',
            "customerFirstName": customer.firstName,
            "customerLastName": customer.lastName,
            "customerPhone": customer.msisdn,
            "wallet": customer.msisdn,
            "apiKey": "da553166-106f-48a6-bbf5-5eb291ec6555"
        }

        return this.httpService.post(PAYMENT_URL+'/debit', paymentPayload)
        .toPromise()
        .then( async (response) => {
            console.log(response.data);
                
            if(response.data.status == 200){
                let transactionToUpdate = await this.transactionRepository.findOne({
                    where: {
                        id: Equal(createdTransaction.id)
                    }
                });

                 transactionToUpdate.externalTransactionID = response.data.body.reference;
                const updatedTrans = await this.transactionRepository.save(transactionToUpdate);
                console.log('===================Transaction Updated========================', updatedTrans);
                
                return  response.data;
            }else{
               
                throw new HttpException('Could not complete transaction, Please try again after some time.', HttpStatus.BAD_REQUEST); 
                
            }
        }).catch(err => {
            throw new HttpException('Could not complete transaction, Please try again after some time.', HttpStatus.BAD_REQUEST);
        })
    }


    

    
}
