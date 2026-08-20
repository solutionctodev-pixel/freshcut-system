import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QrCodesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createMyQrCode(userId: string) {
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

    await this.prisma.qRCode.updateMany({
      where: {
        customerId: customer.id,
        active: true,
      },
      data: {
        active: false,
      },
    });

    const token =
      randomBytes(32).toString('hex');

    return this.prisma.qRCode.create({
      data: {
        customerId: customer.id,
        token,
        active: true,
      },
    });
  }

  async getMyQrCode(userId: string) {
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

    const existingQr =
      await this.prisma.qRCode.findFirst({
        where: {
          customerId: customer.id,
          active: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (existingQr) {
      return existingQr;
    }

    // Kein QR-Code vorhanden → automatisch erstellen
    const token =
      randomBytes(32).toString('hex');

    return this.prisma.qRCode.create({
      data: {
        customerId: customer.id,
        token,
        active: true,
      },
    });
  }

  async scanQrCode(
    token: string,
    branchId: string,
    employeeId: string,
  ) {
    const qrCode =
      await this.prisma.qRCode.findUnique({
        where: {
          token,
        },
        include: {
          customer: {
            include: {
              user: true,
            },
          },
        },
      });

    if (!qrCode || !qrCode.active) {
      throw new BadRequestException(
        'QR-Code ist ungültig',
      );
    }

    if (
      qrCode.expiresAt &&
      qrCode.expiresAt < new Date()
    ) {
      throw new BadRequestException(
        'QR-Code ist abgelaufen',
      );
    }

    const branch =
      await this.prisma.branch.findUnique({
        where: {
          id: branchId,
        },
      });

    if (!branch || !branch.active) {
      throw new NotFoundException(
        'Filiale nicht gefunden oder nicht aktiv',
      );
    }

    const employee =
      await this.prisma.employee.findUnique({
        where: {
          id: employeeId,
        },
      });

    if (!employee) {
      throw new NotFoundException(
        'Mitarbeiter nicht gefunden',
      );
    }

    if (employee.branchId !== branchId) {
      throw new BadRequestException(
        'Mitarbeiter gehört nicht zu dieser Filiale',
      );
    }

    const subscription =
      await this.prisma.subscription.findFirst({
        where: {
          customerId: qrCode.customerId,
          status: 'ACTIVE',
          OR: [
            {
              expiresAt: null,
            },
            {
              expiresAt: {
                gte: new Date(),
              },
            },
          ],
        },
        include: {
          package: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (!subscription) {
      throw new BadRequestException(
        'Keine aktive Membership vorhanden',
      );
    }

    const visit =
      await this.prisma.visit.create({
        data: {
          customerId: qrCode.customerId,
          branchId,
          employeeId,
        },
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
          customer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

    return {
      success: true,
      message: 'Check-in erfolgreich',
      visit,
      subscription,
    };
  }
}