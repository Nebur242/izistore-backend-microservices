import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthUser, Claims } from '../auth/decorators/get-user.decorator';

@Controller('/app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(@Claims() user: AuthUser) {
    console.log(user);
    return this.appService.getData();
  }
}
