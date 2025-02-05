import {
  Injectable,
  Inject,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { GatewayRequest, ServiceName } from '../../common/types';
import { AUTH_SERVICE } from '../../common/constants';
import { firstValueFrom, timeout } from 'rxjs';
import { adminRoutes, publicRoutes } from './constants';

@Injectable()
export class ProxyService {
  private readonly services: Map<ServiceName, ClientProxy>;
  private readonly timeoutDuration = 5000; // 5 seconds

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy // Inject other services here
  ) {
    this.services = new Map([['auth', authService]]);
  }

  async forward(
    serviceName: ServiceName,
    path: string,
    request: GatewayRequest
  ) {
    try {
      const service = this.services.get(serviceName);

      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }

      const normalizedPath = `/${path}`.replace(/\/+/g, '/');

      await this.checkRouteAccess(serviceName, normalizedPath, request);

      const pattern = {
        cmd: request.method.toLowerCase(),
        path: `/${path}`.replace(/\/+/g, '/'), // Normalize path
      };

      // Prepare the payload
      const payload = {
        path,
        method: request.method,
        body: request.body,
        query: request.query,
        headers: request.headers,
        user: request.user || null,
      };

      const response = await firstValueFrom(
        service.send(pattern, payload).pipe(timeout(this.timeoutDuration))
      );
      return response;
    } catch (error) {
      this.handleProxyError(error, serviceName);
      // throw new BadRequestException('hello');
    }
  }

  private async checkRouteAccess(
    service: string,
    path: string,
    request: GatewayRequest
  ): Promise<void> {
    const isPublic = this.isPublicRoute(service, path, request.method);

    if (isPublic) {
      return;
    }

    const isAdminRoute = this.isAdminRoute(service, path, request.method);

    if (isAdminRoute && !request?.user.isAdmin) {
      throw new UnauthorizedException('Admin access required');
    }

    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    // For tenant-specific routes, ensure tenant context
    if (!isAdminRoute && !request?.user.tenantId && !request?.user.isAdmin) {
      throw new UnauthorizedException('Tenant context required');
    }
  }

  private handleProxyError(
    err: {
      error?: {
        status: number;
        message: number;
        code: string;
      };
      name?: string;
    },
    serviceName: string
  ) {
    console.error(`❌ Error in ${serviceName} service:`, err.error);

    // Handle RpcException with proper error structure extraction
    if (err.error) {
      const { status, message, code } = err.error;
      throw new HttpException(
        {
          statusCode: status,
          message,
          code,
        },
        status
      );
    }

    // Handle timeout errors
    if (err?.name === 'TimeoutError') {
      throw new HttpException(
        {
          statusCode: HttpStatus.GATEWAY_TIMEOUT,
          message: `${serviceName} service timeout`,
          code: 'GATEWAY_TIMEOUT',
        },
        HttpStatus.GATEWAY_TIMEOUT
      );
    }

    // Handle NestJS HttpException
    if (err instanceof HttpException) {
      const status = err.getStatus();
      throw new HttpException(
        {
          statusCode: status,
          message: err.message,
          code: 'HTTP_ERROR',
        },
        status
      );
    }

    // Handle generic/unexpected errors
    console.error(`🛑 Unexpected error format in ${serviceName}:`, err);
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Internal error in ${serviceName} service`,
        code: 'INTERNAL_ERROR',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private isPublicRoute(
    service: string,
    path: string,
    method: string
  ): boolean {
    const serviceRoutes = publicRoutes[service] || [];
    return serviceRoutes.some(
      (route) =>
        path.startsWith(route.path) &&
        (!route.method || route.method === method)
    );
  }

  private isAdminRoute(service: string, path: string, method: string): boolean {
    const serviceRoutes = adminRoutes[service] || [];
    return serviceRoutes.some(
      (route) =>
        path.startsWith(route.path) &&
        (!route.method || route.method === method)
    );
  }
}
