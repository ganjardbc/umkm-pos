import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TransactionItemsService {
  constructor(private prisma: PrismaService) {}

  async findByTransaction(transactionId: string, merchantId: string) {
    // Ensure transaction belongs to this merchant via outlet
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const transaction = await this.prisma.transactions.findFirst({
      where: {
        id: transactionId,
        outlet_id: { in: outletIds },
      },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    return this.prisma.transaction_items.findMany({
      where: { transaction_id: transactionId },
      orderBy: { created_at: 'asc' },
    });
  }
}
