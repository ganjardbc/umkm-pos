import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  private async attachSignedUrl(user: any) {
    if (!user?.avatar_upload_id) return user;

    return {
      ...user,
      avatar: (await this.uploadsService.generateSignedUrl(user.avatar_upload_id))
        .url,
    };
  }

  /**
   * List all users for the current merchant.
   * Never returns password_hash.
   */
  async findAll(merchantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;
    const where = { merchant_id: merchantId };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.users.findMany({
        where,
        include: { merchants: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.users.count({ where }),
    ]);

    const sanitizedUsers = users.map(({ password_hash: _, ...user }) => user);
    const data = await Promise.all(
      sanitizedUsers.map((user) => this.attachSignedUrl(user)),
    );
    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  /**
   * Get a single user by ID (merchant-scoped).
   */
  async findOne(id: string, merchantId: string) {
    const user = await this.prisma.users.findFirst({
      include: { merchants: true },
      where: { id, merchant_id: merchantId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return this.attachSignedUrl(userWithoutPassword);
  }

  /**
   * Create a new user under the current merchant.
   * - username and email must be unique per merchant.
   * - Password is hashed before storage.
   */
  async create(dto: CreateUserDto, merchantId: string, createdBy: string) {
    // Check email uniqueness per merchant
    const existingEmail = await this.prisma.users.findFirst({
      where: { merchant_id: merchantId, email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists for this merchant');
    }

    // Check username uniqueness per merchant
    const existingUsername = await this.prisma.users.findFirst({
      where: { merchant_id: merchantId, username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists for this merchant');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password_hash,
        avatar: dto.avatar,
        is_active: dto.is_active ?? true,
        merchant_id: merchantId,
        created_by: createdBy,
        updated_by: createdBy,
      },
    });

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update a user (merchant-scoped).
   * - Only updates provided fields.
   * - Re-hashes password if provided.
   * - Validates email/username uniqueness on change.
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    merchantId: string,
    updatedBy: string,
  ) {
    // Ensure user exists and belongs to merchant
    await this.findOne(id, merchantId);

    // Validate email uniqueness if changing
    if (dto.email) {
      const conflict = await this.prisma.users.findFirst({
        where: { merchant_id: merchantId, email: dto.email },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException('Email already exists for this merchant');
      }
    }

    // Validate username uniqueness if changing
    if (dto.username) {
      const conflict = await this.prisma.users.findFirst({
        where: { merchant_id: merchantId, username: dto.username },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          'Username already exists for this merchant',
        );
      }
    }

    const updateData: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
    if (dto.password !== undefined) {
      updateData.password_hash = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.users.update({
      where: { id },
      data: updateData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Soft-delete a user by setting is_active = false (merchant-scoped).
   * Hard delete is intentionally avoided to preserve audit trails in transactions/shifts.
   */
  async remove(id: string, merchantId: string, updatedBy: string) {
    // Ensure user exists and belongs to merchant
    await this.findOne(id, merchantId);

    const user = await this.prisma.users.update({
      where: { id },
      data: {
        is_active: false,
        updated_by: updatedBy,
        updated_at: new Date(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async setAvatar(
    id: string,
    uploadId: string,
    merchantId: string,
    userId: string,
  ) {
    await this.findOne(id, merchantId);

    const upload = await this.prisma.uploads.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    const user = await this.prisma.users.update({
      where: { id },
      data: {
        avatar_upload_id: uploadId,
        avatar: (await this.uploadsService.generateSignedUrl(uploadId)).url,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async removeAvatar(id: string, merchantId: string, userId: string) {
    await this.findOne(id, merchantId);

    const user = await this.prisma.users.update({
      where: { id },
      data: {
        avatar_upload_id: null,
        avatar: null,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
