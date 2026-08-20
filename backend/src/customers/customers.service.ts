import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}
async getDashboard(userId: string) {
  const customer =
    await this.prisma.customer.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true,
          },
        },

        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            package: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },

        qrCodes: {
          where: {
            active: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },

        visits: {
          include: {
            branch: true,
            employee: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

  if (!customer) {
    throw new NotFoundException(
      'Kunde nicht gefunden',
    );
  }

  return {
    customer: customer.user,

    membership:
      customer.subscriptions[0] ?? null,

    qrCode:
      customer.qrCodes[0] ?? null,

    visits: customer.visits,
  };
}
  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        role: true,
        customer: {
          select: {
            id: true,
            dateOfBirth: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kunde nicht gefunden');
    }

    return user;
  }

  async updateMyProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      dateOfBirth?: string;
      profileImage?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        customer: true,
      },
    });

    if (!user || !user.customer) {
      throw new NotFoundException('Kunde nicht gefunden');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        profileImage: data.profileImage,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        role: true,
      },
    });

    await this.prisma.customer.update({
      where: {
        id: user.customer.id,
      },
      data: {
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : undefined,
      },
    });

    return this.getMyProfile(userId);
  }
}