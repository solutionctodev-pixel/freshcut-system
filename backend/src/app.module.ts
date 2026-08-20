import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { BranchesModule } from './branches/branches.module';
import { PackagesModule } from './packages/packages.module';
import { EmployeesModule } from './employees/employees.module';
import { VisitsModule } from './visits/visits.module';
import { QrCodesModule } from './qrcodes/qrcodes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    CustomersModule,
    BranchesModule,
    PackagesModule,
    EmployeesModule,
    VisitsModule,
    QrCodesModule,
SubscriptionsModule,
PaymentsModule,
AdminModule,

  ],

  controllers: [
    AppController,
  ],
})
export class AppModule {}