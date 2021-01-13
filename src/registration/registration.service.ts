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

@Injectable()
export class RegistrationService {

    fetchCustomerDetailsUrl: string;

    constructor(
        private httpService: HttpService, 
        @InjectRepository(Customer)
        private readonly customerRepository: CustomerRepository,
        @InjectRepository(Account)
        private readonly accounRepository: AccountRepository,
        @InjectRepository(User)
        private readonly userRepository: UserRepository
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
            msisdn: '260762432603',
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
        const response = await this.fetchClientDetails(payload);
        console.log('fetch Data res => ',response);
        console.log(payload);

        const userDetails = await this.userRepository.findOne({
            where: {
                msisdn: payload.msisdn
            }
        });

        if (userDetails) {
            console.log(userDetails);
            throw new HttpException('User Already Exist', HttpStatus.CONFLICT);
          } else {

            let customerData = new Customer();
            let userData = new User();

            customerData.firstName = response.first_name;
            customerData.lastName = response.last_name;
            customerData.msisdn = response.msisdn;
            customerData.status = response.status;
            customerData.idNumber = response.nationalId;
            customerData.updated_at = moment().format('YYYY-MM-DD HH:MM:SS');
            customerData.created_at = moment().format('YYYY-MM-DD HH:MM:SS');
            
            userData.customer = customerData;
            userData.password = payload.password;
            userData.address = payload.address;
            userData.name = response.first_name+' '+response.last_name;
            userData.email = payload.email;
            userData.msisdn = customerData.msisdn;
            userData.updated_at = moment().format('YYYY-MM-DD HH:MM:SS');
            userData.created_at = moment().format('YYYY-MM-DD HH:MM:SS');


            if(response.status == 200){
                const createdCustomer = this.customerRepository.create(customerData);
                const createdUser = this.userRepository.create(userData);
                return await this.customerRepository.save(createdCustomer)
                .then( async cust => {
                    console.log(cust);
                    const userToReturn = await this.userRepository.save(createdUser);
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
                    const res = new ErrorResponse();
                    res.status = HttpStatus.BAD_REQUEST;
                    res.message = 'Failed to register user';
                    res.error = err;

                    return res;
                })
            }else{
                console.log('Failed to save info');
                const res = new ErrorResponse();
                    res.status = HttpStatus.BAD_REQUEST;
                    res.message = 'Failed to register user';
                    res.error = null;

                    return res;
            }

          }

        
        
    }
}
