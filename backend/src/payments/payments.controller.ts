import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('checkout')
  async createCheckout(
    @Body()
    body: {
      packageId: string;
      packageName: string;
      price: number;
      billingInterval: string;
    },
  ) {
    return this.paymentsService.createCheckoutSession(
      body,
    );
  }

  @Post('webhook')
  async webhook(
    @Req() req: any,
    @Headers('stripe-signature')
    signature: string,
  ) {
    return this.paymentsService.handleWebhook(
      req.body,
      signature,
    );
  }
}