import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const now = new Date();

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      customers,
      employees,
      branches,
      visits,
      activeSubscriptions,
      expiredSubscriptions,
      paidPayments,
      recentPaidPayments,
      branchPerformance,
    ] = await Promise.all([
      this.prisma.customer.count(),

      this.prisma.employee.count(),

      this.prisma.branch.count(),

      this.prisma.visit.count(),

      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
        },
      }),

      this.prisma.subscription.count({
        where: {
          status: 'EXPIRED',
        },
      }),

      this.prisma.payment.findMany({
        where: {
          status: 'PAID',
        },
        select: {
          amount: true,
        },
      }),

      this.prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prisma.branch.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              visits: true,
              employees: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    const revenue = paidPayments.reduce(
      (total, payment) => total + Number(payment.amount),
      0,
    );

    const revenueLast7Days = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(sevenDaysAgo);

        date.setDate(
          sevenDaysAgo.getDate() + index,
        );

        const dayRevenue = recentPaidPayments
          .filter((payment) => {
            const paymentDate = new Date(
              payment.createdAt,
            );

            return (
              paymentDate.getFullYear() ===
                date.getFullYear() &&
              paymentDate.getMonth() ===
                date.getMonth() &&
              paymentDate.getDate() ===
                date.getDate()
            );
          })
          .reduce(
            (total, payment) =>
              total + Number(payment.amount),
            0,
          );

        return {
          name: date.toLocaleDateString(
            'de-DE',
            {
              weekday: 'short',
            },
          ),
          revenue: dayRevenue,
        };
      },
    );

    return {
      customers,
      employees,
      branches,
      visits,

      subscriptions: {
        active: activeSubscriptions,
        expired: expiredSubscriptions,
      },

      payments: {
        paid: paidPayments.length,
      },

      revenue,

      revenueLast7Days,

      branchPerformance: branchPerformance.map(
        (branch) => ({
          id: branch.id,
          name: branch.name,
          visits: branch._count.visits,
          employees: branch._count.employees,
        }),
      ),
    };
  }
  async getVisits() {
    return this.prisma.visit.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },

        employee: {
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
}
