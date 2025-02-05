import { Request } from 'express';
import { AuthUser } from '../../auth/decorators/get-user.decorator';

export type ServiceName = 'auth';

export type GatewayRequest = Request & {
  user?: AuthUser | null;
};
