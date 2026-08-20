import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('packages')
export class PackagesController {
  constructor(
    private readonly packagesService: PackagesService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPackages() {
    return this.packagesService.getAllPackages();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPackageById(
    @Param('id') id: string,
  ) {
    return this.packagesService.getPackageById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async createPackage(
    @Body()
    body: {
      name: string;
      description?: string;
      price: string;
      type: 'SUBSCRIPTION' | 'CREDIT' | 'HYBRID';
      creditsPerPeriod?: number;
      visitsPerPeriod?: number;
      durationDays?: number;
    },
  ) {
    return this.packagesService.createPackage(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async updatePackage(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: string;
      type?: 'SUBSCRIPTION' | 'CREDIT' | 'HYBRID';
      creditsPerPeriod?: number;
      visitsPerPeriod?: number;
      durationDays?: number;
      active?: boolean;
    },
  ) {
    return this.packagesService.updatePackage(
      id,
      body,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async deactivatePackage(
    @Param('id') id: string,
  ) {
    return this.packagesService.deactivatePackage(id);
  }
}