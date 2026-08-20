import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
      body.phone,
    );
  }

  @Post('login')
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return req.user;
  }

  @Get('customer-test')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('CUSTOMER')
  customerTest(@Req() req: any) {
    return {
      message: 'CUSTOMER Zugriff erlaubt',
      user: req.user,
    };
  }

  /*
   * TEMPORÄR FÜR LOKALE ENTWICKLUNG
   *
   * Erstellt einen Mitarbeiter ohne SUPER_ADMIN Login.
   *
   * Später wieder entfernen oder schützen!
   */
  @Post('create-employee-test')
  async createEmployeeTest(
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
    return this.authService.createEmployee(body);
  }

  @Post('employee-password-test')
  async employeePasswordTest(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.resetEmployeePassword(
      body.email,
      body.password,
    );
  }
}