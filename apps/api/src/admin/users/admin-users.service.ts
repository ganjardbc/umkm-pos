import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { UploadsService } from '../../uploads/uploads.service';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  AdminCreateUserDto,
  AdminUserRoleDto,
  AdminUsersQueryDto,
} from './dto/admin-users.dto';

const USER_MERCHANT = {
  merchants: { select: { id: true, name: true, slug: true } },
};

@Injectable()
export class AdminUsersService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  private sanitize<T extends { password_hash: string }>(user: T) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async attachSignedUrl(user: any) {
    if (!user?.avatar_upload_id) return user;

    return {
      ...user,
      avatar: (
        await this.uploadsService.generateSignedUrl(user.avatar_upload_id)
      ).url,
    };
  }

  private async getUserOrThrow(id: string) {
    const user = await this.prisma.users.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Login looks users up by email alone, so email must be unique platform-wide.
   */
  private async assertEmailAvailable(email: string, exceptId?: string) {
    const conflict = await this.prisma.users.findFirst({ where: { email } });

    if (conflict && conflict.id !== exceptId) {
      throw new ConflictException('Email already registered');
    }
  }

  private async assertUsernameAvailable(
    merchantId: string,
    username: string,
    exceptId?: string,
  ) {
    const conflict = await this.prisma.users.findFirst({
      where: { merchant_id: merchantId, username },
    });

    if (conflict && conflict.id !== exceptId) {
      throw new ConflictException('Username already exists for this merchant');
    }
  }

  async findAll(query: AdminUsersQueryDto) {
    const { page = 1, limit = 10, search, merchant_id } = query;
    const skip = query.skip;
    const where = {
      ...(merchant_id && { merchant_id }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { username: { contains: search } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.users.findMany({
        where,
        include: USER_MERCHANT,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.users.count({ where }),
    ]);

    const data = await Promise.all(
      users.map((user) => this.attachSignedUrl(this.sanitize(user))),
    );

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: USER_MERCHANT,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.attachSignedUrl(this.sanitize(user));
  }

  async create(dto: AdminCreateUserDto, createdBy: string) {
    const merchant = await this.prisma.merchants.findUnique({
      where: { id: dto.merchant_id },
    });

    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    await this.assertEmailAvailable(dto.email);
    await this.assertUsernameAvailable(dto.merchant_id, dto.username);

    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password_hash: await bcrypt.hash(dto.password, 10),
        avatar: dto.avatar,
        is_active: dto.is_active ?? true,
        merchant_id: dto.merchant_id,
        created_by: createdBy,
        updated_by: createdBy,
      },
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto, updatedBy: string) {
    const existing = await this.getUserOrThrow(id);

    if (dto.email) {
      await this.assertEmailAvailable(dto.email, id);
    }

    if (dto.username) {
      await this.assertUsernameAvailable(
        existing.merchant_id,
        dto.username,
        id,
      );
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

    return this.sanitize(user);
  }

  /**
   * Soft-delete (is_active = false) to preserve transaction/shift audit trails.
   */
  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    await this.getUserOrThrow(id);

    const user = await this.prisma.users.update({
      where: { id },
      data: {
        is_active: false,
        updated_by: currentUserId,
        updated_at: new Date(),
      },
    });

    return this.sanitize(user);
  }

  async setAvatar(id: string, uploadId: string, userId: string) {
    await this.getUserOrThrow(id);

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

    return this.sanitize(user);
  }

  async removeAvatar(id: string, userId: string) {
    await this.getUserOrThrow(id);

    const user = await this.prisma.users.update({
      where: { id },
      data: {
        avatar_upload_id: null,
        avatar: null,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    return this.sanitize(user);
  }

  // ─────────────────────────────────────────────
  //  USER ↔ ROLES
  // ─────────────────────────────────────────────

  async getRoles(userId: string) {
    await this.getUserOrThrow(userId);

    return this.prisma.user_roles.findMany({
      where: { user_id: userId },
      include: {
        roles: { select: { id: true, name: true, description: true } },
        outlets: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async assignRole(userId: string, dto: AdminUserRoleDto, assignedBy: string) {
    const user = await this.getUserOrThrow(userId);

    const outlet = await this.prisma.outlets.findUnique({
      where: { id: dto.outlet_id },
    });
    if (!outlet || outlet.merchant_id !== user.merchant_id) {
      throw new BadRequestException(
        "Outlet not found or does not belong to the user's merchant",
      );
    }

    const role = await this.prisma.roles.findUnique({
      where: { id: dto.role_id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${dto.role_id} not found`);
    }

    const existing = await this.prisma.user_roles.findFirst({
      where: {
        user_id: userId,
        role_id: dto.role_id,
        outlet_id: dto.outlet_id,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Role already assigned to this user at the given outlet',
      );
    }

    return this.prisma.user_roles.create({
      data: {
        user_id: userId,
        role_id: dto.role_id,
        outlet_id: dto.outlet_id,
        created_by: assignedBy,
        updated_by: assignedBy,
      },
    });
  }

  async revokeRole(userId: string, dto: AdminUserRoleDto) {
    await this.getUserOrThrow(userId);

    const existing = await this.prisma.user_roles.findFirst({
      where: {
        user_id: userId,
        role_id: dto.role_id,
        outlet_id: dto.outlet_id,
      },
    });
    if (!existing) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.prisma.user_roles.delete({
      where: {
        user_id_role_id_outlet_id: {
          user_id: userId,
          role_id: dto.role_id,
          outlet_id: dto.outlet_id,
        },
      },
    });

    return { message: 'Role revoked from user successfully' };
  }
}
