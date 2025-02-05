import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { DualAuthGuard } from '../guards/dual-auth.guard';

export const IS_PUBLIC_KEY = 'IS_PUBLIC_KEY';
export const Public = () =>
  applyDecorators(SetMetadata(IS_PUBLIC_KEY, true), UseGuards(DualAuthGuard));
