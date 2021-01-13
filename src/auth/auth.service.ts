import { HttpException, HttpService, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SignInDTO } from 'src/dto/sing_in.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/repositories/user.repository';
import { Customer } from 'src/entities/customer.entity';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: UserRepository,
        @InjectRepository(Customer)
        private readonly customerRepository: CustomerRepository,
        private readonly jwtService: JwtService,
        private httpService: HttpService,
    ) { }

    public async login(user: SignInDTO): Promise< any | { status: number }>{
        console.log("USER--->",user);
        return this.validate(user).then(async (userData)=>{
          console.log("USER DATA===>", userData)
          if(!userData){
            // return { status: 404 };
            throw new HttpException(
                    'User Not Found, Check Your Email',
                    HttpStatus.NOT_FOUND,
                    );
          }else if (userData.status === 400){
            throw new HttpException(
                'Email or Password was invalid',
                HttpStatus.BAD_REQUEST,
                );
          }else{
          

          Logger.log(userData, 'User Role In Auth Service');

          let payload = `${userData.name}${userData.id}`;
          const accessToken = this.jwtService.sign(payload);

          return {
             expires_in: 3600,
             name:userData.name,
             id: userData.id,
             email: userData.email,
             msisdn: userData.msisdn,
             access_token: accessToken,
             user_id: payload,
             status: 200
          };
        }
        });
    }

    public async validate(userData: SignInDTO): Promise<User | any>{
        const user = await this.findByMsisdn(userData.msisdn);
        console.log(user);
        // console.log(userData.password);
        // console.log(user.password);
        if(user){
            const result = await this.compareHash(userData.password, user.password);
            console.log('=========*****************************=========');
            console.log(result);
                if(result == true){
                    return user;
                }else{
                    throw new HttpException(
                    'Email or Password was invalid',
                    HttpStatus.BAD_REQUEST,
                    );
                
                }
        }else if(!user){
            return user;

        }
       
       
    }

    async compareHash(password: string|undefined, hash: string|undefined): Promise<boolean> {
        console.log('Password ==================>',password)
        console.log('Hash ==================>',hash)
        const result = await bcrypt.compare(password, hash);
        return result;
      }

      async findByMsisdn(msisdn: string): Promise<User> {
        return await this.userRepository.findOne({
            where: {
                msisdn: msisdn
            },
            relations: ['customer']
        });
      }
}
