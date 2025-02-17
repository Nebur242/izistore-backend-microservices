import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(`auth-service - ${AppController.name}`);

  constructor(private readonly appService: AppService) {}

  @MessagePattern('ping_auth_service')
  getData(data: { message: string }) {
    this.logger.log('data', data);
    return this.appService.getData();
  }
}
