import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../common/constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy
  ) {}

  async getData(): Promise<{ message: string }> {
    const response = await firstValueFrom(
      this.authService.send('ping_auth_service', { message: 'up' })
    );
    return response;
  }
}
