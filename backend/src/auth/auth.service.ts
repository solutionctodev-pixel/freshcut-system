import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      throw new ConflictException(
        'E-Mail bereits registriert',
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: 'CUSTOMER',

        customer: {
          create: {},
        },
      },

      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });
  }

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new UnauthorizedException(
        'E-Mail oder Passwort falsch',
      );
    }

    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'E-Mail oder Passwort falsch',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token:
        await this.jwtService.signAsync(payload),

      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async createEmployee(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    branchId: string;
  }) {
    const branch =
      await this.prisma.branch.findUnique({
        where: {
          id: data.branchId,
        },
      });

    if (!branch) {
      throw new NotFoundException(
        'Filiale nicht gefunden',
      );
    }

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'E-Mail bereits registriert',
      );
    }

    const passwordHash =
      await bcrypt.hash(
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

  async resetEmployeePassword(
    email: string,
    newPassword: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Mitarbeiter nicht gefunden',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        newPassword,
        12,
      );

    return this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordHash,
        role: 'EMPLOYEE',
      },

      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }
}