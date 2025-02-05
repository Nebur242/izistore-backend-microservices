import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type FirebaseDecodedUser = {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: false;
  firebase: {
    [key: string]: string;
  };
  uid: string;
};

export type AuthUser = {
  uid: string;
  email: string;
  isAdmin: boolean;
  tenantId?: string;
};

export const Claims = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return field ? req.user[field] : req.user;
  }
);
