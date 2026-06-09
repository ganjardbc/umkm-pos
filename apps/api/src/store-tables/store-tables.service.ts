import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateStoreTableDto } from './dto/create-store-table.dto';
import { UpdateStoreTableDto } from './dto/update-store-table.dto';

@Injectable()
export class StoreTablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(merchantId: string, outletId: string, activeOnly = false) {
    await this.assertOutlet(outletId, merchantId);

    return this.prisma.store_tables.findMany({
      where: {
        merchant_id: merchantId,
        outlet_id: outletId,
        ...(activeOnly && { is_active: true }),
      },
      orderBy: [{ is_active: 'desc' }, { code: 'asc' }],
    });
  }

  async findOne(id: string, merchantId: string) {
    const table = await this.prisma.store_tables.findFirst({
      where: { id, merchant_id: merchantId },
    });

    if (!table) {
      throw new NotFoundException('Store table not found');
    }

    return table;
  }

  async create(
    outletId: string,
    dto: CreateStoreTableDto,
    merchantId: string,
    userId: string,
  ) {
    await this.assertOutlet(outletId, merchantId);
    await this.ensureUniqueCode(outletId, merchantId, dto.code);

    return this.prisma.store_tables.create({
      data: {
        outlet_id: outletId,
        merchant_id: merchantId,
        code: dto.code,
        name: dto.name,
        capacity: dto.capacity ?? null,
        is_active: dto.is_active ?? true,
        created_by: userId,
        updated_by: userId,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateStoreTableDto,
    merchantId: string,
    userId: string,
  ) {
    const table = await this.findOne(id, merchantId);
    if (dto.code && dto.code !== table.code) {
      await this.ensureUniqueCode(table.outlet_id, merchantId, dto.code, id);
    }

    return this.prisma.store_tables.update({
      where: { id },
      data: {
        ...dto,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, merchantId: string) {
    await this.findOne(id, merchantId);
    return this.prisma.store_tables.delete({ where: { id } });
  }

  private async assertOutlet(outletId: string, merchantId: string) {
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
    });

    if (!outlet) {
      throw new BadRequestException('Outlet not found');
    }

    return outlet;
  }

  private async ensureUniqueCode(
    outletId: string,
    merchantId: string,
    code: string,
    currentId?: string,
  ) {
    const existing = await this.prisma.store_tables.findFirst({
      where: {
        outlet_id: outletId,
        merchant_id: merchantId,
        code,
      },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Table code already exists in this outlet');
    }
  }
}
