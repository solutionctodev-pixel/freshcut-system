import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { QrCodesService } from './qrcodes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('qrcodes')
export class QrCodesController {
  constructor(
    private readonly qrCodesService: QrCodesService,
  ) {}

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async createMyQrCode(@Req() req: any) {
    return this.qrCodesService.createMyQrCode(
      req.user.id,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyQrCode(@Req() req: any) {
    return this.qrCodesService.getMyQrCode(
      req.user.id,
    );
  }

  @Post('scan')
  @UseGuards(JwtAuthGuard)
  async scanQrCode(
    @Body()
    body: {
      token: string;
      branchId: string;
      employeeId: string;
    },
  ) {
    return this.qrCodesService.scanQrCode(
      body.token,
      body.branchId,
      body.employeeId,
    );
  }
}