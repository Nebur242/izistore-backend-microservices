import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { DualAuthGuard } from '../guards/dual-auth.guard';

export const ADMIN_ONLY_KEY = 'ADMIN_ONLY_KEY';
export const AdminOnly = () =>
  applyDecorators(SetMetadata(ADMIN_ONLY_KEY, true), UseGuards(DualAuthGuard));
