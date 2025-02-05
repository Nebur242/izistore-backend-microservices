import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { AuthUser, Claims } from '../auth/decorators/get-user.decorator';

@Controller('/app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AdminOnly()
  getData(@Claims() user: AuthUser) {
    console.log(user);
    return this.appService.getData();
  }
}
