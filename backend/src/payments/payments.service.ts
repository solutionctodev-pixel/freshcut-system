import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createCheckoutSession(data: {
    packageId: string;
    packageName: string;
    price: number;
    billingInterval: string;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',

      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: data.packageName,
            },
            unit_amount: Math.round(data.price * 100),
            recurring: {
              interval:
                data.billingInterval === 'YEARLY'
                  ? 'year'
                  : 'month',
            },
          },
          quantity: 1,
        },
      ],

      success_url:
        'http://localhost:3001/checkout/success',

      cancel_url:
        'http://localhost:3001/checkout',

      metadata: {
        packageId: data.packageId,
      },
    });

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async handleWebhook(
    payload: Buffer,
    signature: string,
  ) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    console.log(
      'STRIPE WEBHOOK:',
      event.type,
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log(
          'CHECKOUT ERFOLGREICH:',
          session.id,
        );

        console.log(
          'PACKAGE ID:',
          session.metadata?.packageId,
        );

        console.log(
          'CUSTOMER:',
          session.customer,
        );

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;

        console.log(
          'RECHNUNG BEZAHLT:',
          invoice.id,
        );

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription =
          event.data.object as Stripe.Subscription;

        console.log(
          'ABONNEMENT BEENDET:',
          subscription.id,
        );

        break;
      }

      default:
        console.log(
          'STRIPE EVENT:',
          event.type,
        );
    }

    return {
      received: true,
    };
  }
}
