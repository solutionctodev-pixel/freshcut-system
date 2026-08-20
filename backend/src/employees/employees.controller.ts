import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.employeesService.getMyEmployee(
      req.user.id,
    );
  }
}