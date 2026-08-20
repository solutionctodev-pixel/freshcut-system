import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('branches')
export class BranchesController {
  constructor(
    private readonly branchesService: BranchesService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllBranches() {
    return this.branchesService.getAllBranches();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getBranchById(
    @Param('id') id: string,
  ) {
    return this.branchesService.getBranchById(id);
  }

  @Get(':id/employees')
  @UseGuards(JwtAuthGuard)
  async getBranchEmployees(
    @Param('id') id: string,
  ) {
    return this.branchesService.getBranchEmployees(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')  async createBranch(
    @Body()
    body: {
      name: string;
      address?: string;
      city?: string;
      postalCode?: string;
    },
  ) {
    return this.branchesService.createBranch(body);
  }
  @Post('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
async createEmployee(
  @Body()
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    branchId: string;
  },
) {
  return this.branchesService.createEmployee(body);
}
}