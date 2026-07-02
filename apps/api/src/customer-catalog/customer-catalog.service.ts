import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { StartCustomerSessionDto } from './dto/start-customer-session.dto';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';

const SESSION_DURATION_HOURS = 6;

@Injectable()
export class CustomerCatalogService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  async startSession(dto: StartCustomerSessionDto) {
    const outlet = await this.prisma.outlets.findFirst({
      where: {
        id: dto.outlet_id,
        is_active: true,
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    if (
      !outlet.guest_session_secret ||
      outlet.guest_session_secret !== dto.secret_code
    ) {
      throw new UnauthorizedException('Secret code is invalid');
    }

    const session = await this.prisma.customer_sessions.create({
      data: {
        merchant_id: outlet.merchant_id,
        outlet_id: outlet.id,
        session_token: randomUUID(),
        secret_code: dto.secret_code,
        customer_name: dto.customer_name,
        customer_phone: dto.customer_phone ?? null,
        status: 'active',
        expires_at: this.getExpiryDate(),
      },
      include: {
        outlets: true,
      },
    });

    return session;
  }

  async getSession(sessionToken: string) {
    const session = await this.resolveSession(sessionToken);
    const latestTransaction = await this.prisma.transactions.findFirst({
      where: {
        customer_session_id: session.id,
        is_cancelled: false,
      },
      include: {
        transaction_items: true,
        store_tables: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      ...session,
      latest_transaction: latestTransaction,
    };
  }

  async getSessionStatus(sessionToken: string) {
    const session = await this.resolveSession(sessionToken);
    const latestTransaction = await this.prisma.transactions.findFirst({
      where: {
        customer_session_id: session.id,
        is_cancelled: false,
      },
      select: {
        id: true,
        order_status: true,
        is_cancelled: true,
        completed_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      session_status: session.status,
      expires_at: session.expires_at,
      latest_transaction: latestTransaction,
    };
  }

  async getShiftStatus(outletId: string) {
    if (!outletId) {
      throw new BadRequestException('outlet_id is required');
    }

    await this.resolveOutlet(outletId);
    const shift = await this.findOpenShift(outletId);

    return {
      is_open: Boolean(shift),
      shift_id: shift?.id ?? null,
      status: shift?.status ?? 'closed',
    };
  }

  async listCategories(outletId: string) {
    const outlet = await this.resolveOutlet(outletId);

    return this.prisma.product_categories.findMany({
      where: {
        merchant_id: outlet.merchant_id,
        is_active: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async listProducts(query: CatalogProductsQueryDto) {
    if (!query.outlet_id) {
      throw new BadRequestException('outlet_id is required');
    }

    const outlet = await this.resolveOutlet(query.outlet_id);

    const { page = 1, limit = 10 } = query;
    const where = {
      merchant_id: outlet.merchant_id,
      is_active: true,
      ...(query.category_id && { category_id: query.category_id }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search } },
          { category: { contains: query.search } },
        ],
      }),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.products.findMany({
        where,
        include: {
          product_categories: true,
          upload: true,
          outlet_product_inventory: {
            where: {
              outlet_id: query.outlet_id,
              is_active: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: limit,
      }),
      this.prisma.products.count({ where }),
    ]);

    const data = products
      .map((product) => {
        const inventory = product.outlet_product_inventory[0];
        return {
          ...product,
          stock_qty: inventory?.stock_qty ?? 0,
          min_stock: inventory?.min_stock ?? 0,
        };
      })
      .filter((product) => product.stock_qty > 0);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listTables(outletId: string) {
    await this.resolveOutlet(outletId);

    return this.prisma.store_tables.findMany({
      where: {
        outlet_id: outletId,
        is_active: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async createOrder(sessionToken: string, dto: CreateTransactionDto) {
    const session = await this.resolveSession(sessionToken);
    if (session.outlet_id !== dto.outlet_id) {
      throw new UnauthorizedException('Session does not match outlet');
    }

    const shift = await this.findOpenShift(dto.outlet_id);
    if (!shift) {
      throw new BadRequestException('Shift outlet belum dibuka');
    }

    return this.transactionsService.createCatalogOrder(
      {
        ...dto,
        shift_id: shift.id,
        customer_session_id: session.id,
        customer_name_snapshot: session.customer_name,
        customer_phone_snapshot: session.customer_phone ?? undefined,
      },
      session.merchant_id,
    );
  }

  async getOrder(sessionToken: string, id: string) {
    const session = await this.resolveSession(sessionToken);
    const transaction = await this.prisma.transactions.findFirst({
      where: {
        id,
        customer_session_id: session.id,
        order_source: 'customer_catalog',
        is_cancelled: false,
      },
      include: {
        transaction_items: true,
        store_tables: true,
        customer_sessions: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return transaction;
  }

  private async resolveOutlet(outletId: string) {
    if (!outletId) {
      throw new BadRequestException('outlet_id is required');
    }

    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, is_active: true },
    });
    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    return outlet;
  }

  private async findOpenShift(outletId: string) {
    return this.prisma.shifts.findFirst({
      where: {
        outlet_id: outletId,
        status: 'open',
      },
      orderBy: { start_time: 'desc' },
    });
  }

  private async resolveSession(sessionToken: string) {
    const session = await this.prisma.customer_sessions.findFirst({
      where: {
        session_token: sessionToken,
      },
      include: {
        outlets: true,
        store_tables: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Customer session not found');
    }

    if (session.expires_at <= new Date()) {
      await this.prisma.customer_sessions.update({
        where: { id: session.id },
        data: {
          status: 'expired',
          updated_at: new Date(),
        },
      });
      throw new UnauthorizedException('Customer session has expired');
    }

    return session;
  }

  private getExpiryDate() {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + SESSION_DURATION_HOURS);
    return expiry;
  }
}
