import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class OutletsService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  private async attachSignedUrl(outlet: any) {
    if (!outlet?.logo_upload_id) return outlet;

    return {
      ...outlet,
      logo: (
        await this.uploadsService.generateSignedUrl(
          outlet.logo_upload_id,
          outlet.merchant_id,
        )
      ).url,
    };
  }

  async findAll(merchantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;
    const where = { merchant_id: merchantId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.outlets.findMany({
        where,
        include: { merchants: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.outlets.count({ where }),
    ]);

    const outletIds = data.map((outlet) => outlet.id);

    const productCounts = outletIds.length
      ? await this.prisma.outlet_product_inventory.groupBy({
          by: ['outlet_id'],
          where: { merchant_id: merchantId, outlet_id: { in: outletIds } },
          _count: { product_id: true },
        })
      : [];

    const countMap = new Map(
      productCounts.map((item) => [item.outlet_id, item._count.product_id]),
    );

    const dataWithSignedUrls = await Promise.all(
      data.map(async (outlet) => ({
        ...(await this.attachSignedUrl(outlet)),
        product_count: countMap.get(outlet.id) ?? 0,
      })),
    );

    return {
      data: dataWithSignedUrls,
      meta: PaginationDto.calculateMeta(total, page, limit),
    };
  }

  async findOne(id: string, merchantId: string) {
    const outlet = await this.prisma.outlets.findFirst({
      where: { id, merchant_id: merchantId },
      include: { merchants: true },
    });

    if (!outlet) {
      throw new NotFoundException(`Outlet with ID ${id} not found`);
    }

    return this.attachSignedUrl(outlet);
  }

  async create(dto: CreateOutletDto, merchantId: string, userId: string) {
    // Slug must be unique per merchant
    const existing = await this.prisma.outlets.findFirst({
      where: { merchant_id: merchantId, slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(
        'Outlet slug already exists for this merchant',
      );
    }

    return this.prisma.outlets.create({
      data: {
        ...dto,
        merchant_id: merchantId,
        is_active: dto.is_active ?? true,
        created_by: userId,
        updated_by: userId,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateOutletDto,
    merchantId: string,
    userId: string,
  ) {
    // Ensure outlet exists and belongs to this merchant
    await this.findOne(id, merchantId);

    // Check slug uniqueness if being updated
    if (dto.slug) {
      const conflict = await this.prisma.outlets.findFirst({
        where: { merchant_id: merchantId, slug: dto.slug },
      });

      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          'Outlet slug already exists for this merchant',
        );
      }
    }

    return this.prisma.outlets.update({
      where: { id },
      data: {
        ...dto,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, merchantId: string) {
    // Ensure outlet exists and belongs to this merchant
    await this.findOne(id, merchantId);

    return this.prisma.outlets.delete({
      where: { id },
    });
  }

  async setImage(
    id: string,
    uploadId: string,
    merchantId: string,
    userId: string,
  ) {
    await this.findOne(id, merchantId);

    const upload = await this.prisma.uploads.findUnique({
      where: { id: uploadId },
    });

    if (!upload || (upload.merchant_id && upload.merchant_id !== merchantId)) {
      throw new BadRequestException('Upload not found');
    }

    return this.prisma.outlets.update({
      where: { id },
      data: {
        logo_upload_id: uploadId,
        logo: (
          await this.uploadsService.generateSignedUrl(uploadId, merchantId)
        ).url,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  async removeImage(id: string, merchantId: string, userId: string) {
    await this.findOne(id, merchantId);

    return this.prisma.outlets.update({
      where: { id },
      data: {
        logo_upload_id: null,
        logo: null,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }
}
