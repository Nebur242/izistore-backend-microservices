import { Controller, All, Req, Param } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { GatewayRequest, ServiceName } from '../../common/types';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All(':service/*') // This will capture all paths after the service name
  async proxy(
    @Req() req: GatewayRequest,
    @Param('service') service: ServiceName,
    @Param('0') path: string
  ) {
    return this.proxyService.forward(service, path, req);
  }
}
