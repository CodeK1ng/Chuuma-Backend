import { HttpModule, Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';

@Module({
  providers: [RegistrationService],
  controllers: [RegistrationController],
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    })
  ],
})
export class RegistrationModule {}
