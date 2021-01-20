import { HttpException, HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { CustomerDTO } from 'src/dto/customer.dto';
import { Customer } from 'src/entities/customer.entity';
import { CustomerRepository } from 'src/repositories/customer.repository';
import moment = require('moment');
import { AccountRepository } from 'src/repositories/accounts.repository';
import { Account } from 'src/entities/accounts.entity';
import { UserRepository } from 'src/repositories/user.repository';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorResponse, SuccessResponse } from 'src/responses/success.response';
import { BalanceToWithdraw } from 'src/entities/balanceToWithdraw.entity';
import { Product } from 'src/entities/product.entity';
import { ProductRepository } from 'src/repositories/product.repository';
import { format, addDays, parseISO } from 'date-fns'
import { BalanceToWithdrawRepository } from 'src/repositories/balanceToWidraw.repository';

@Injectable()
export class RegistrationService {

    fetchCustomerDetailsUrl: string;

    constructor(
        private httpService: HttpService, 
        @InjectRepository(Customer)
        private readonly customerRepository: CustomerRepository,
        @InjectRepository(Account)
        private readonly accountRepository: AccountRepository,
        @InjectRepository(User)
        private readonly userRepository: UserRepository,
        @InjectRepository(Product)
        private readonly productRepository: ProductRepository,
        @InjectRepository(BalanceToWithdraw)
        private readonly balanceToWithdrawRepository: BalanceToWithdrawRepository,
        ){}

    fetchClientDetails(payload): any{

        console.log(payload);
        
            return this.httpService.post<any>('http://41.175.8.68:9090/registration', payload)
            .toPromise()
            .then(async res => {
                console.log(res.data);
                
                const response = {
                    msisdn: res.data.MSISDN,
                    first_name: res.data.first_name,
                    last_name: res.data.last_name,
                    nationalId: res.data.NRC,
                    regStatus: res.data.status,
                    status: HttpStatus.OK
                }
                
                return response;
            }).catch(err => {
                return err;
            });
        
    }

    testing(){
        const response = {
            msisdn: '260971042607',
            first_name: 'Daniel',
            last_name: 'Sitali',
            email: 'daniel@mail.com',
            nationalId: '532683/10/1',
            regStatus: 150,
            status: HttpStatus.OK
        }
        
        return response;
    }

    async registerClient(payload: CustomerDTO): Promise<any>{
        //const response = await this.fetchClientDetails(payload);
        // const response = this.testing();
        //console.log('fetch Data res => ',response);
        console.log(payload);

        if(!payload.msisdn == null || payload.msisdn.length != 12){
            throw new HttpException('Please send correct phone number', HttpStatus.BAD_REQUEST);
        }

        const userDetails = await this.userRepository.findOne({
            where: {
                msisdn: payload.msisdn
            }
        });

        console.log('User Details ======>>',userDetails);
        

        if (userDetails) {
            console.log(userDetails);
            throw new HttpException('User Already Exist', HttpStatus.CONFLICT);
          } else {

            const customerData = new Customer();
            const userData = new User();
            
            

            customerData.firstName = payload.first_name;
            customerData.lastName = payload.last_name;
            customerData.msisdn = payload.msisdn;
            customerData.status = 150;
            customerData.updated_at = moment().format('YYYY-MM-DD HH:MM:SS');
            customerData.created_at = moment().format('YYYY-MM-DD HH:MM:SS');

            
            
                const createdCustomer = this.customerRepository.create(customerData);
                
                return await this.customerRepository.save(createdCustomer)
                .then( async cust => {
                    console.log(cust);

                   

                    const customer = await this.customerRepository.findOne({
                        where: {
                            msisdn: payload.msisdn
                        },
                        relations: ['accounts','balanceToWithdraw'],
                    });

                    console.log('Customer Details ======>>',customer);

                    userData.customer = customer;
                    userData.password = payload.password;
                    userData.address = payload.address;
                    userData.name = payload.first_name+' '+payload.last_name;
                    userData.email = payload.email;
                    userData.msisdn = customerData.msisdn;
                    userData.updated_at = moment().format('YYYY-MM-DD HH:MM:SS');
                    userData.created_at = moment().format('YYYY-MM-DD HH:MM:SS');
        
                    const createdUser = this.userRepository.create(userData);
                    const userToReturn = await this.userRepository.save(createdUser);
                    
                    let products = await this.productRepository.find();

                    products.forEach( async product => {

                        let account = new Account;
                        let balanceToWithAcc = new BalanceToWithdraw();
                        
                        account.account_type_id = product.id;
                        account.balance = 0;
                        account.msisdn = payload.msisdn;
                        account.customer = customer;
                        account.created_at = moment().format('YYYY-MM-DD HH:MM:SS');
                        account.updated_at = moment().format('YYYY-MM-DD HH:MM:SS');


                        balanceToWithAcc.account_type_id = product.id;
                        balanceToWithAcc.balance = 0;
                        balanceToWithAcc.customer = customer;
                        balanceToWithAcc.msisdn = payload.msisdn;
                        balanceToWithAcc.created_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');
                        balanceToWithAcc.updated_at = format(new Date(), 'yyyy-MM-dd HH:MM:SS');

                        let createdAcc = await this.accountRepository.save(account);
                        
                        customer.accounts.push(createdAcc)
                        await this.customerRepository.save(customer);

                        await this.balanceToWithdrawRepository.save(balanceToWithAcc);
                        customer.balanceToWithdraw.push(balanceToWithAcc)
                        await this.customerRepository.save(customer);

                        console.log('==================DONE====================================');
                        

                    });

                    const message = 'You are have successfully registered on Chuuma, Start your journey today'
                    await this.httpService.get<any>("http://sms01.rubicube.org/bulksms/bulksms?username=simbani&password=simbani%40321&type=0&dlr=1&destination="+userToReturn.msisdn+"&source=Chuuma&message="+message)
                                                    .toPromise()
                                                    .then(async res => {
                                                        console.log(res.data);
                                                        
                                                    }).catch(err => {
                                                    
                                                    });
                                                
                    const res = new SuccessResponse();
                    res.status = HttpStatus.OK;
                    res.message = 'User Created Successfully';
                    res.body = userToReturn;

                    return res;
                    }
                )
                .catch(err => {

                    return err;
                })
           
          }

        
        
    }
}
function foreach(arg0: (products: any) => any) {
    throw new Error('Function not implemented.');
}

