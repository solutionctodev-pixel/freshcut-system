import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getMyEmployee(userId: string) {
    const employee =
      await this.prisma.employee.findFirst({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          branch: true,
        },
      });

    if (!employee) {
      throw new NotFoundException(
        'Mitarbeiter nicht gefunden',
      );
    }

    return employee;
  }
}