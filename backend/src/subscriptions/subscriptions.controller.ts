import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Req() req: any,
    @Body()
    body: {
      packageId: string;
    },
  ) {
    return this.subscriptionsService.createSubscription(
      req.user.id,
      body.packageId,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMySubscriptions(
    @Req() req: any,
  ) {
    return this.subscriptionsService.getMySubscriptions(
      req.user.id,
    );
  }
}