import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────
  //  ROLES
  // ─────────────────────────────────────────────

  async createRole(dto: CreateRoleDto, _createdBy: string) {
    const existing = await this.prisma.roles.findFirst({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    return this.prisma.roles.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAllRoles(pagination: PaginationDto = new PaginationDto()) {
    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.roles.findMany({
        orderBy: { name: 'asc' },
        include: {
          role_permissions: {
            include: { permissions: true },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.roles.count(),
    ]);

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  async findOneRole(id: string) {
    const role = await this.prisma.roles.findFirst({
      where: { id },
      include: {
        role_permissions: {
          include: { permissions: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto, _updatedBy: string) {
    await this.findOneRole(id);

    if (dto.name) {
      const conflict = await this.prisma.roles.findFirst({
        where: { name: dto.name },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Role name "${dto.name}" already exists`);
      }
    }

    return this.prisma.roles.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        updated_at: new Date(),
      },
    });
  }

  async removeRole(id: string) {
    await this.findOneRole(id);
    await this.prisma.roles.delete({ where: { id } });
    return { message: `Role ${id} deleted successfully` };
  }

  // ─────────────────────────────────────────────
  //  PERMISSIONS
  // ─────────────────────────────────────────────

  async createPermission(dto: CreatePermissionDto, createdBy: string) {
    const existing = await this.prisma.permissions.findFirst({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Permission code "${dto.code}" already exists`,
      );
    }

    return this.prisma.permissions.create({
      data: {
        code: dto.code,
        description: dto.description,
        created_by: createdBy,
        updated_by: createdBy,
      },
    });
  }

  async findAllPermissions(pagination: PaginationDto = new PaginationDto()) {
    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.permissions.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.permissions.count(),
    ]);

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  async findOnePermission(id: string) {
    const permission = await this.prisma.permissions.findFirst({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async removePermission(id: string) {
    await this.findOnePermission(id);
    await this.prisma.permissions.delete({ where: { id } });
    return { message: `Permission ${id} deleted successfully` };
  }

  // ─────────────────────────────────────────────
  //  ROLE ↔ PERMISSIONS
  // ─────────────────────────────────────────────

  async assignPermissionToRole(
    roleId: string,
    dto: AssignPermissionDto,
    assignedBy: string,
  ) {
    await this.findOneRole(roleId);
    await this.findOnePermission(dto.permission_id);

    const existing = await this.prisma.role_permissions.findFirst({
      where: { role_id: roleId, permission_id: dto.permission_id },
    });
    if (existing) {
      throw new ConflictException('Permission already assigned to this role');
    }

    return this.prisma.role_permissions.create({
      data: {
        role_id: roleId,
        permission_id: dto.permission_id,
        created_by: assignedBy,
        updated_by: assignedBy,
      },
    });
  }

  async revokePermissionFromRole(roleId: string, permissionId: string) {
    await this.findOneRole(roleId);

    const existing = await this.prisma.role_permissions.findFirst({
      where: { role_id: roleId, permission_id: permissionId },
    });
    if (!existing) {
      throw new NotFoundException('Permission is not assigned to this role');
    }

    await this.prisma.role_permissions.delete({
      where: {
        role_id_permission_id: { role_id: roleId, permission_id: permissionId },
      },
    });

    return { message: 'Permission revoked from role successfully' };
  }

  // ─────────────────────────────────────────────
  //  USER ↔ ROLES
  // ─────────────────────────────────────────────

  async assignRoleToUser(dto: AssignRoleDto, assignedBy: string) {
    await this.findOneRole(dto.role_id);

    const existing = await this.prisma.user_roles.findFirst({
      where: {
        user_id: dto.user_id,
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
        user_id: dto.user_id,
        role_id: dto.role_id,
        outlet_id: dto.outlet_id,
        created_by: assignedBy,
        updated_by: assignedBy,
      },
    });
  }

  async revokeRoleFromUser(dto: AssignRoleDto) {
    const existing = await this.prisma.user_roles.findFirst({
      where: {
        user_id: dto.user_id,
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
          user_id: dto.user_id,
          role_id: dto.role_id,
          outlet_id: dto.outlet_id,
        },
      },
    });

    return { message: 'Role revoked from user successfully' };
  }

  async getUserRoles(userId: string) {
    return this.prisma.user_roles.findMany({
      where: { user_id: userId },
      include: {
        users: {
          select: { id: true, name: true, email: true, is_active: true },
        },
        roles: {
          include: {
            role_permissions: {
              include: { permissions: true },
            },
          },
        },
        outlets: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }
}
