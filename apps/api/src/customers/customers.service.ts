import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateCustomerDto,
  CustomersQueryDto,
  UpdateCustomerDto,
} from './dto/customer.dto';

// 08xx / 8xx / +62 8xx -> 628xx, so the same person always matches and WhatsApp links work.
export const normalizePhone = (raw?: string | null): string | null => {
  if (raw == null || raw.trim() === '') return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;
  if (!/^\d{9,15}$/.test(digits)) {
    throw new BadRequestException('Phone number is not valid');
  }
  return digits;
};

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(merchantId: string, query: CustomersQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const where = {
      merchant_id: merchantId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search.replace(/\D/g, '') || search } },
        ],
      }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.customers.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: limit,
      }),
      this.prisma.customers.count({ where }),
    ]);
    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  // Customer plus what they have bought: lifetime totals (cancelled excluded) and recent visits.
  async findOne(id: string, merchantId: string) {
    const customer = await this.prisma.customers.findFirst({
      where: { id, merchant_id: merchantId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const [stats, recent] = await Promise.all([
      this.prisma.transactions.aggregate({
        where: { customer_id: id, is_cancelled: false },
        _count: { _all: true },
        _sum: { total_amount: true },
        _max: { created_at: true },
      }),
      this.prisma.transactions.findMany({
        where: { customer_id: id },
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          created_at: true,
          total_amount: true,
          payment_method: true,
          is_cancelled: true,
          outlets: { select: { name: true } },
        },
      }),
    ]);

    return {
      ...customer,
      stats: {
        transaction_count: stats._count._all,
        total_spent: stats._sum.total_amount ?? 0,
        last_visit: stats._max.created_at,
      },
      recent_transactions: recent,
    };
  }

  async create(dto: CreateCustomerDto, merchantId: string, userId: string) {
    const phone = normalizePhone(dto.phone);
    await this.assertPhoneFree(phone, merchantId);
    return this.prisma.customers.create({
      data: {
        merchant_id: merchantId,
        name: dto.name.trim(),
        phone,
        note: dto.note?.trim() || null,
        created_by: userId,
        updated_by: userId,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
    merchantId: string,
    userId: string,
  ) {
    await this.findOne(id, merchantId);
    const phone =
      dto.phone === undefined ? undefined : normalizePhone(dto.phone);
    if (phone) await this.assertPhoneFree(phone, merchantId, id);
    return this.prisma.customers.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(phone !== undefined && { phone }),
        ...(dto.note !== undefined && { note: dto.note.trim() || null }),
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  // Past transactions keep their name/phone snapshot; the link is set NULL by the FK.
  async remove(id: string, merchantId: string) {
    await this.findOne(id, merchantId);
    return this.prisma.customers.delete({ where: { id } });
  }

  private async assertPhoneFree(
    phone: string | null,
    merchantId: string,
    exceptId?: string,
  ) {
    if (!phone) return;
    const clash = await this.prisma.customers.findFirst({
      where: { merchant_id: merchantId, phone },
    });
    if (clash && clash.id !== exceptId) {
      throw new ConflictException(
        `Phone number already belongs to customer "${clash.name}"`,
      );
    }
  }
}
