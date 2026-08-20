import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db-test')
  async dbTest() {
    const result = await this.prisma.$queryRaw<
      { result: number }[]
    >`SELECT 1 as result`;

    return {
      database: 'connected',
      result: result[0]?.result,
    };
  }
}