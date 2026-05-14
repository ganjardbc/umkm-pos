import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database';
import { AuthModule } from './auth/auth.module';
import { MerchantsModule } from './merchants/merchants.module';
import { OutletsModule } from './outlets/outlets.module';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionItemsModule } from './transaction_items/transaction-items.module';
import { ShiftsModule } from './shifts/shifts.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { MetricsModule } from './metrics/metrics.module';
import { StockModule } from './stock/stock.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    MerchantsModule,
    OutletsModule,
    ProductsModule,
    TransactionsModule,
    TransactionItemsModule,
    ShiftsModule,
    AuditLogsModule,
    MetricsModule,
    StockModule,
    UsersModule,
    RbacModule,
    ReportsModule,
    SettingsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JwtAuthGuard globally to all routes
    // Can be bypassed with @Public() decorator
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
