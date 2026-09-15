import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ADMIN_MERCHANT_SLUG } from '../../common/constants/admin.constants';

const RECENT_WINDOW_DAYS = 30;
const RECENT_MERCHANTS_LIMIT = 5;

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Platform-wide statistics. The admin merchant itself is excluded so the
   * numbers reflect tenant merchants only.
   */
  async getStats() {
    const since = new Date(
      Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const tenantMerchant = { slug: { not: ADMIN_MERCHANT_SLUG } };

    const [
      totalMerchants,
      newMerchants,
      activeMerchants,
      totalOutlets,
      activeOutlets,
      totalUsers,
      activeUsers,
      recentMerchants,
    ] = await Promise.all([
      this.prisma.merchants.count({ where: tenantMerchant }),
      this.prisma.merchants.count({
        where: { ...tenantMerchant, created_at: { gte: since } },
      }),
      this.prisma.merchants.count({
        where: {
          ...tenantMerchant,
          outlets: {
            some: { transactions: { some: { created_at: { gte: since } } } },
          },
        },
      }),
      this.prisma.outlets.count({ where: { merchants: tenantMerchant } }),
      this.prisma.outlets.count({
        where: { merchants: tenantMerchant, is_active: true },
      }),
      this.prisma.users.count({ where: { merchants: tenantMerchant } }),
      this.prisma.users.count({
        where: { merchants: tenantMerchant, is_active: true },
      }),
      this.prisma.merchants.findMany({
        where: tenantMerchant,
        orderBy: { created_at: 'desc' },
        take: RECENT_MERCHANTS_LIMIT,
        select: {
          id: true,
          name: true,
          slug: true,
          created_at: true,
          _count: { select: { outlets: true, users: true } },
        },
      }),
    ]);

    return {
      window_days: RECENT_WINDOW_DAYS,
      merchants: {
        total: totalMerchants,
        new: newMerchants,
        active: activeMerchants,
      },
      outlets: { total: totalOutlets, active: activeOutlets },
      users: { total: totalUsers, active: activeUsers },
      recent_merchants: recentMerchants,
    };
  }
}
