import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createVisit(
    userId: string,
    branchId: string,
    employeeId?: string,
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

    return this.createVisitForCustomer(
      customer.id,
      branchId,
      employeeId,
    );
  }

  async createVisitForCustomer(
    customerId: string,
    branchId: string,
    employeeId?: string,
  ) {
    const customer =
      await this.prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        'Kunde nicht gefunden',
      );
    }

    const branch =
      await this.prisma.branch.findUnique({
        where: {
          id: branchId,
        },
      });

    if (!branch) {
      throw new NotFoundException(
        'Filiale nicht gefunden',
      );
    }

    if (!branch.active) {
      throw new NotFoundException(
        'Filiale ist nicht aktiv',
      );
    }

    if (employeeId) {
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
        throw new NotFoundException(
          'Mitarbeiter gehört nicht zu dieser Filiale',
        );
      }
    }

    const subscription =
      await this.prisma.subscription.findFirst({
        where: {
          customerId: customer.id,
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
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (!subscription) {
      throw new NotFoundException(
        'Keine aktive Membership vorhanden',
      );
    }

    return this.prisma.visit.create({
      data: {
        customerId: customer.id,
        branchId,
        employeeId: employeeId ?? null,
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
  }

  async checkInByQrToken(
    qrToken: string,
    branchId: string,
    employeeId?: string,
  ) {
    const qrCode =
      await this.prisma.qRCode.findUnique({
        where: {
          token: qrToken,
        },
      });

    if (!qrCode) {
      throw new NotFoundException(
        'QR-Code nicht gefunden',
      );
    }

    if (!qrCode.active) {
      throw new NotFoundException(
        'QR-Code ist nicht aktiv',
      );
    }

    if (
      qrCode.expiresAt &&
      qrCode.expiresAt < new Date()
    ) {
      throw new NotFoundException(
        'QR-Code ist abgelaufen',
      );
    }

    const visit =
      await this.createVisitForCustomer(
        qrCode.customerId,
        branchId,
        employeeId,
      );

    return {
      message: 'Check-in erfolgreich',
      visit,
    };
  }

  async getMyVisits(userId: string) {
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

    return this.prisma.visit.findMany({
      where: {
        customerId: customer.id,
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
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async scanQrCode(
  userId: string,
  token: string,
) {
  const employee =
    await this.prisma.employee.findUnique({
      where: {
        userId,
      },
    });

  if (!employee) {
    throw new NotFoundException(
      'Mitarbeiter nicht gefunden',
    );
  }

  const qrCode =
    await this.prisma.qRCode.findUnique({
      where: {
        token,
      },
        include: {
        customer: true,
      },
    });

  if (!qrCode) {
    throw new NotFoundException(
      'QR-Code nicht gefunden',
    );
  }

  if (!qrCode.active) {
    throw new NotFoundException(
      'QR-Code ist nicht aktiv',
    );
  }

  if (
    qrCode.expiresAt &&
    qrCode.expiresAt < new Date()
  ) {
    throw new NotFoundException(
      'QR-Code ist abgelaufen',
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
      orderBy: {
        createdAt: 'desc',
      },
    });

  if (!subscription) {
    throw new NotFoundException(
      'Keine aktive Membership vorhanden',
    );
  }

  const visit =
    await this.prisma.visit.create({
      data: {
        customerId: qrCode.customerId,
        branchId: employee.branchId,
        employeeId: employee.id,
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
    message: 'Kunde erfolgreich eingecheckt',
    visit,
  };
}
}