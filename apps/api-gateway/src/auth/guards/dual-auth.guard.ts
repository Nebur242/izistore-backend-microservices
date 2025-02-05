import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator';
import { publicRoutes } from '../../modules/proxy/constants';
import { Request } from 'express';

@Injectable()
export class DualAuthGuard extends AuthGuard('firebase') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // Check if it's a public route from configuration

    if (this.isPublicRoute(request)) return true;

    // For non-public routes, try to authenticate
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      if (this.isPublicRoute(request)) return true;
      throw error;
    }
  }

  handleRequest(err: unknown, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Allow public routes to pass without user info
    if (this.isPublicRoute(request)) {
      return true;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(
      ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isAdminOnly && !user.isAdmin) {
      throw new UnauthorizedException('Admin access required');
    }

    // Add user info to request object
    request.user = user;
    request.tenantId = user.tenantId;
    request.isAdmin = user.isAdmin;

    return user;
  }

  private isPublicRoute(request: Request): boolean {
    const path = request.params['0'] || request.url.split('?')[0];
    const method = request.method;
    const service = request.params.service;

    if (!service || !publicRoutes[service]) {
      return false;
    }

    return publicRoutes[service].some(
      (route: { path: string; method: string }) =>
        path.startsWith(route.path.replace(/^\//, '')) &&
        (!route.method || route.method === method)
    );
  }
}
