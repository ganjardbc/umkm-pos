import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UploadsService } from '../../uploads/uploads.service';
import { UpdateOutletDto } from '../../outlets/dto/update-outlet.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  AdminCreateOutletDto,
  AdminOutletsQueryDto,
} from './dto/admin-outlets.dto';

const OUTLET_MERCHANT = {
  merchants: { select: { id: true, name: true, slug: true } },
};

@Injectable()
export class AdminOutletsService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  private async attachSignedUrl(outlet: any) {
    if (!outlet?.logo_upload_id) return outlet;

    return {
      ...outlet,
      logo: (await this.uploadsService.generateSignedUrl(outlet.logo_upload_id))
        .url,
    };
  }

  private async assertSlugAvailable(
    merchantId: string,
    slug: string,
    exceptId?: string,
  ) {
    const conflict = await this.prisma.outlets.findFirst({
      where: { merchant_id: merchantId, slug },
    });

    if (conflict && conflict.id !== exceptId) {
      throw new ConflictException(
        'Outlet slug already exists for this merchant',
      );
    }
  }

  async findAll(query: AdminOutletsQueryDto) {
    const { page = 1, limit = 10, search, merchant_id } = query;
    const skip = query.skip;
    const where = {
      ...(merchant_id && { merchant_id }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { location: { contains: search } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.outlets.findMany({
        where,
        include: OUTLET_MERCHANT,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.outlets.count({ where }),
    ]);

    const dataWithSignedUrls = await Promise.all(
      data.map((outlet) => this.attachSignedUrl(outlet)),
    );

    return {
      data: dataWithSignedUrls,
      meta: PaginationDto.calculateMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    const outlet = await this.prisma.outlets.findUnique({
      where: { id },
      include: OUTLET_MERCHANT,
    });

    if (!outlet) {
      throw new NotFoundException(`Outlet with ID ${id} not found`);
    }

    return this.attachSignedUrl(outlet);
  }

  async create(dto: AdminCreateOutletDto, userId: string) {
    const merchant = await this.prisma.merchants.findUnique({
      where: { id: dto.merchant_id },
    });

    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    await this.assertSlugAvailable(dto.merchant_id, dto.slug);

    return this.prisma.outlets.create({
      data: {
        ...dto,
        is_active: dto.is_active ?? true,
        created_by: userId,
        updated_by: userId,
      },
    });
  }

  async update(id: string, dto: UpdateOutletDto, userId: string) {
    const outlet = await this.findOne(id);

    if (dto.slug) {
      await this.assertSlugAvailable(outlet.merchant_id, dto.slug, id);
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

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.outlets.delete({
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

    return this.prisma.outlets.update({
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
