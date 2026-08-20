import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBranches() {
    return this.prisma.branch.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        postalCode: true,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getBranchById(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id: branchId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        postalCode: true,
        active: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Filiale nicht gefunden');
    }

    return branch;
  }

  async getBranchEmployees(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id: branchId,
      },
    });

    if (!branch) {
      throw new NotFoundException('Filiale nicht gefunden');
    }

    return this.prisma.employee.findMany({
      where: {
        branchId,
      },
      select: {
        id: true,
        branchId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
            role: true,
          },
        },
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    });
  }

  async createBranch(data: {
    name: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }) {
    return this.prisma.branch.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        postalCode: true,
        active: true,
      },
    });
  }
  async createEmployee(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  branchId: string;
}) {
  const branch = await this.prisma.branch.findUnique({
    where: {
      id: data.branchId,
    },
  });

  if (!branch) {
    throw new NotFoundException('Filiale nicht gefunden');
  }

  const existingUser = await this.prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error('E-Mail bereits registriert');
  }

  const bcrypt = await import('bcrypt');

  const passwordHash = await bcrypt.hash(
    data.password,
    12,
  );

  return this.prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'EMPLOYEE',

      employee: {
        create: {
          branchId: data.branchId,
        },
      },
    },

    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,

      employee: {
        select: {
          id: true,
          branchId: true,
        },
      },
    },
  });
}
}
