import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('customers')
export class CustomersController {
  @Get('me/dashboard')
@UseGuards(JwtAuthGuard)
async getDashboard(@Req() req: any) {
  return this.customersService.getDashboard(
    req.user.id,
  );
}
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  async getMyProfile(@Req() req: any) {
    return this.customersService.getMyProfile(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  async updateMyProfile(
    @Req() req: any,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      dateOfBirth?: string;
      profileImage?: string;
    },
  ) {
    return this.customersService.updateMyProfile(
      req.user.id,
      body,
    );
  }
}