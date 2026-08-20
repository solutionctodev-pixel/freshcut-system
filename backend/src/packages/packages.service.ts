import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PackagesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAllPackages() {
    return this.prisma.package.findMany({
      where: {
        active: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  async getPackageById(id: string) {
    const packageItem =
      await this.prisma.package.findUnique({
        where: {
          id,
        },
      });

    if (!packageItem) {
      throw new NotFoundException(
        'Paket nicht gefunden',
      );
    }

    return packageItem;
  }

  async createPackage(data: {
    name: string;
    description?: string;
    price: string;
    type: any;
    creditsPerPeriod?: number;
    visitsPerPeriod?: number;
    durationDays?: number;
  }) {
    return this.prisma.package.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        type: data.type,
        creditsPerPeriod:
          data.creditsPerPeriod,
        visitsPerPeriod:
          data.visitsPerPeriod,
        durationDays:
          data.durationDays,
        active: true,
      },
    });
  }

  async updatePackage(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: string;
      type?: any;
      creditsPerPeriod?: number;
      visitsPerPeriod?: number;
      durationDays?: number;
      active?: boolean;
    },
  ) {
    const existingPackage =
      await this.prisma.package.findUnique({
        where: {
          id,
        },
      });

    if (!existingPackage) {
      throw new NotFoundException(
        'Paket nicht gefunden',
      );
    }

    return this.prisma.package.update({
      where: {
        id,
      },
      data,
    });
  }

  async deactivatePackage(id: string) {
    const existingPackage =
      await this.prisma.package.findUnique({
        where: {
          id,
        },
      });

    if (!existingPackage) {
      throw new NotFoundException(
        'Paket nicht gefunden',
      );
    }

    return this.prisma.package.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
  }
}