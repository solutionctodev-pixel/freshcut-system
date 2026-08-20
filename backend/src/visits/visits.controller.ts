import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('visits')
export class VisitsController {
  constructor(
    private readonly visitsService: VisitsService,
  ) {}

  @Post('scan')
  @UseGuards(JwtAuthGuard)
  async scanQrCode(
    @Req() req: any,
    @Body()
    body: {
      token: string;
    },
  ) {
    return this.visitsService.scanQrCode(
      req.user.id,
      body.token,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createVisit(
    @Req() req: any,
    @Body()
    body: {
      branchId: string;
      employeeId?: string;
    },
  ) {
    return this.visitsService.createVisit(
      req.user.id,
      body.branchId,
      body.employeeId,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyVisits(
    @Req() req: any,
  ) {
    return this.visitsService.getMyVisits(
      req.user.id,
    );
  }
}