import { Controller, ForbiddenException } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './entities/tenant.entity';

@ApiTags('Tenants')
@Controller()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @MessagePattern({ cmd: 'post', path: '/tenant' })
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully',
    type: Tenant,
  })
  async createTenant(data: { body: CreateTenantDto }) {
    return this.tenantService.createTenant(data.body);
  }

  @MessagePattern({ cmd: 'get', path: '/tenant/:id' })
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant found', type: Tenant })
  async getTenant(data: { params: { id: string }; user: any }) {
    const tenant = await this.tenantService.getTenant(data.params.id);

    // Check if user has access to this tenant
    if (data.user.tenantId !== tenant.tenantId && data.user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    return tenant;
  }
}
