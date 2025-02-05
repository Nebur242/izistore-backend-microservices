import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { FirebaseService } from '@izistore/firebase';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private readonly firebaseService: FirebaseService
  ) {}

  async createTenant(data: CreateTenantDto) {
    try {
      // Check if domain already exists
      const existingTenant = await this.tenantRepository.findOne({
        where: { domain: data.domain },
      });

      if (existingTenant) {
        throw new ConflictException('Domain already exists');
      }

      // Create Firebase tenant
      const firebaseTenant = await this.firebaseService.createTenant(data.name);

      // Create tenant in database
      const tenant = this.tenantRepository.create({
        tenantId: firebaseTenant.tenantId,
        name: data.name,
        domain: data.domain,
      });

      return this.tenantRepository.save(tenant);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      // Log the error for debugging
      console.error('Tenant creation error:', error);

      throw new InternalServerErrorException(
        'Failed to create tenant. Please try again.'
      );
    }
  }

  async getTenant(tenantId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async getTenants() {
    return this.tenantRepository.find();
  }
}
