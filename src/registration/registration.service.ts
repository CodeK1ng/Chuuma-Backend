import { HttpException, HttpService, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class RegistrationService {

    fetchCustomerDetailsUrl: string;

    constructor(private httpService: HttpService){}

    registerClient(payload){

        console.log(payload.msisdn);
        
        if(payload.msisdn.substr(0,5) == '26097' || payload.msisdn.substr(0,5) == '26077'){
            this.fetchCustomerDetailsUrl = '';
        }else if(payload.msisdn.substr(0,5) == '26096' || payload.msisdn.substr(0,5) == '26076'){
            this.fetchCustomerDetailsUrl = 'http://10.10.35.14/patumba-live/integration/getKYC.php';
        }else{
            return new HttpException(
                'Error Occured, Please Check your  MSISDN',
                HttpStatus.BAD_REQUEST,
                );
        }

        return this.httpService.post<any>(this.fetchCustomerDetailsUrl, payload)
        .toPromise()
        .then(async res => {
            console.log(res.data);
            return res.data;
        }).catch(err => {
            return err;
        });
    }
}
