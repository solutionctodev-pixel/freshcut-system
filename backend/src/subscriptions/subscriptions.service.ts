import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createSubscription(
    userId: string,
    packageId: string,
  ) {
    const customer =
      await this.prisma.customer.findUnique({
        where: {
          userId,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        'Kunde nicht gefunden',
      );
    }

    const packageItem =
      await this.prisma.package.findUnique({
        where: {
          id: packageId,
        },
      });

    if (!packageItem) {
      throw new NotFoundException(
        'Paket nicht gefunden',
      );
    }

    const startedAt = new Date();

const expiresAt = new Date(startedAt);

if (packageItem.billingInterval === 'MONTHLY') {
  expiresAt.setMonth(expiresAt.getMonth() + 1);
} else {
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
}

    return this.prisma.subscription.create({
      data: {
        customerId: customer.id,
        packageId,
        status: 'ACTIVE',
        startedAt,
        expiresAt,
        autoRenew: true,
      },

      include: {
        package: true,

        customer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async getMySubscriptions(
    userId: string,
  ) {
    const customer =
      await this.prisma.customer.findUnique({
        where: {
          userId,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        'Kunde nicht gefunden',
      );
    }

    return this.prisma.subscription.findMany({
      where: {
        customerId: customer.id,
      },

      include: {
        package: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}