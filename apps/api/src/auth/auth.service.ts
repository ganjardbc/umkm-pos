import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

/**
 * Auth Service
 * Handles authentication logic
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * User login
   * Validates credentials and returns JWT token with RBAC data
   */
  async login(dto: LoginDto) {
    // Find user by email with merchant_id (compound unique key)
    // We need to find first since email alone is not unique
    const user = await this.prisma.users.findFirst({
      where: { email: dto.email },
      include: {
        merchants: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    // Fetch user RBAC data
    const rbac = await this.getUserRbac(user.id);

    return {
      access_token: token,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        merchant_id: user.merchant_id,
        merchant: user.merchants,
        is_active: user.is_active,
      },
      rbac,
    };
  }

  /**
   * User registration
   * Creates merchant, outlets, and user account in a transaction
   * Automatically assigns "Owner" role to the new user for all outlets
   * Returns JWT token with RBAC data
   */
  async register(dto: RegisterDto) {
    // Check if merchant slug already exists
    const existingMerchant = await this.prisma.merchants.findUnique({
      where: { slug: dto.merchant.slug },
    });

    if (existingMerchant) {
      throw new ConflictException('Merchant slug already exists');
    }

    // Check if email already exists (across all merchants)
    const existingUser = await this.prisma.users.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate username from email (before @)
    const username = dto.email.split('@')[0];

    // Create merchant, outlets, and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create merchant
      const merchant = await tx.merchants.create({
        data: {
          slug: dto.merchant.slug,
          name: dto.merchant.name,
          phone: dto.merchant.phone,
          address: dto.merchant.address,
          logo: dto.merchant.logo,
        },
      });

      // 2. Create outlets
      const outlets = await Promise.all(
        dto.outlets.map((outlet) =>
          tx.outlets.create({
            data: {
              merchant_id: merchant.id,
              slug: outlet.slug,
              name: outlet.name,
              location: outlet.location,
              logo: outlet.logo,
              is_active: true,
            },
          }),
        ),
      );

      // 3. Create user
      const user = await tx.users.create({
        data: {
          name: dto.name,
          email: dto.email,
          username: username,
          password_hash: hashedPassword,
          merchant_id: merchant.id,
          is_active: true,
        },
        include: {
          merchants: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // 4. Find the "owner" role
      const ownerRole = await tx.roles.findFirst({
        where: { name: 'owner' },
      });

      if (!ownerRole) {
        throw new Error('Owner role not found in the system');
      }

      // 5. Assign "owner" role to the user for all outlets
      await Promise.all(
        outlets.map((outlet) =>
          tx.user_roles.create({
            data: {
              user_id: user.id,
              role_id: ownerRole.id,
              outlet_id: outlet.id,
            },
          }),
        ),
      );

      return { merchant, outlets, user };
    });

    // Generate JWT token
    const token = this.generateToken(result.user.id, result.user.email);

    // Fetch user RBAC data
    const rbac = await this.getUserRbac(result.user.id);

    return {
      access_token: token,
      token_type: 'Bearer',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        username: result.user.username,
        merchant_id: result.user.merchant_id,
        merchant: result.user.merchants,
        is_active: result.user.is_active,
      },
      merchant: {
        id: result.merchant.id,
        name: result.merchant.name,
        slug: result.merchant.slug,
      },
      outlets: result.outlets.map((outlet) => ({
        id: outlet.id,
        name: outlet.name,
        slug: outlet.slug,
        location: outlet.location,
      })),
      rbac,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        merchants: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user without password_hash
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      merchant_id: user.merchant_id,
      merchants: user.merchants,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  /**
   * Get user RBAC data (roles and permissions)
   * Fetches all roles assigned to user with their permissions
   */
  private async getUserRbac(userId: string) {
    const userRoles = await this.prisma.user_roles.findMany({
      where: { user_id: userId },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: {
                permissions: true,
              },
            },
          },
        },
        outlets: true,
      },
    });

    // Transform to a more usable format
    return userRoles.map((ur) => {
      const rolePerms = ur.roles.role_permissions || [];
      const permissions = rolePerms.map((rp) => ({
        id: rp.permissions.id,
        code: rp.permissions.code,
        description: rp.permissions.description,
      }));

      return {
        outlet: {
          id: ur.outlets.id,
          name: ur.outlets.name,
          slug: ur.outlets.slug,
          logo: ur.outlets.logo,
        },
        role: {
          id: ur.roles.id,
          name: ur.roles.name,
          description: ur.roles.description,
          permissions,
        },
      };
    });
  }
}
