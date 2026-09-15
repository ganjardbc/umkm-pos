import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UploadsService } from '../../uploads/uploads.service';
import { CreateMerchantDto } from '../../merchants/dto/create-merchant.dto';
import { UpdateMerchantDto } from '../../merchants/dto/update-merchant.dto';
import { MerchantsQueryDto } from '../../merchants/dto/merchants-query.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { isPlatformAdminMerchant } from '../../common/constants/admin.constants';

const MERCHANT_COUNTS = {
  _count: { select: { outlets: true, users: true } },
};

@Injectable()
export class AdminMerchantsService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  private async attachSignedUrl(merchant: any) {
    if (!merchant?.logo_upload_id) return merchant;

    return {
      ...merchant,
      logo: (
        await this.uploadsService.generateSignedUrl(merchant.logo_upload_id)
      ).url,
    };
  }

  async findAll(query: MerchantsQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = query.skip;
    const where = search
      ? {
          OR: [{ name: { contains: search } }, { slug: { contains: search } }],
        }
      : undefined;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.merchants.findMany({
        where,
        include: MERCHANT_COUNTS,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.merchants.count({ where }),
    ]);

    const dataWithSignedUrls = await Promise.all(
      data.map((merchant) => this.attachSignedUrl(merchant)),
    );

    return {
      data: dataWithSignedUrls,
      meta: PaginationDto.calculateMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchants.findUnique({
      where: { id },
      include: MERCHANT_COUNTS,
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }

    return this.attachSignedUrl(merchant);
  }

  async create(dto: CreateMerchantDto, userId: string) {
    const existing = await this.prisma.merchants.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Merchant slug already exists');
    }

    return this.prisma.merchants.create({
      data: {
        ...dto,
        created_by: userId,
        updated_by: userId,
      },
    });
  }

  async update(id: string, dto: UpdateMerchantDto, userId: string) {
    const merchant = await this.findOne(id);

    if (dto.slug && dto.slug !== merchant.slug) {
      if (isPlatformAdminMerchant(merchant.slug)) {
        throw new ForbiddenException('The admin merchant slug cannot change');
      }

      const existing = await this.prisma.merchants.findUnique({
        where: { slug: dto.slug },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Merchant slug already exists');
      }
    }

    return this.prisma.merchants.update({
      where: { id },
      data: {
        ...dto,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    const merchant = await this.findOne(id);

    if (isPlatformAdminMerchant(merchant.slug)) {
      throw new ForbiddenException('The admin merchant cannot be deleted');
    }

    return this.prisma.merchants.delete({
      where: { id },
    });
  }

  async setImage(id: string, uploadId: string, userId: string) {
    await this.findOne(id);

    const upload = await this.prisma.uploads.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    return this.prisma.merchants.update({
      where: { id },
      data: {
        logo_upload_id: uploadId,
        logo: (await this.uploadsService.generateSignedUrl(uploadId)).url,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  async removeImage(id: string, userId: string) {
    await this.findOne(id);

    return this.prisma.merchants.update({
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
