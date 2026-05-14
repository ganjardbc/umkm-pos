import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SettingsService {
  private verificationCodes: Map<string, { code: string; expiresAt: Date }> =
    new Map();

  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        name: dto.name,
        avatar: dto.avatar,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        updated_at: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        updated_at: true,
      },
    });
  }

  async requestEmailVerification(userId: string, dto: VerifyEmailDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingUser = await this.prisma.users.findFirst({
      where: {
        email: dto.email,
        merchant_id: user.merchant_id,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Email already in use');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    this.verificationCodes.set(dto.email, { code, expiresAt });

    console.log(`Verification code for ${dto.email}: ${code}`);

    return {
      success: true,
      message: 'Verification code sent to email',
    };
  }

  async updateEmail(userId: string, dto: ChangeEmailDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stored = this.verificationCodes.get(dto.newEmail);
    if (!stored) {
      throw new BadRequestException('Verification code not found or expired');
    }

    if (stored.expiresAt < new Date()) {
      this.verificationCodes.delete(dto.newEmail);
      throw new BadRequestException('Verification code expired');
    }

    if (stored.code !== dto.verificationCode) {
      throw new BadRequestException('Invalid verification code');
    }

    const existingUser = await this.prisma.users.findFirst({
      where: {
        email: dto.newEmail,
        merchant_id: user.merchant_id,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Email already in use');
    }

    this.verificationCodes.delete(dto.newEmail);

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        email: dto.newEmail,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        updated_at: true,
      },
    });
  }

  async deactivateAccount(userId: string, dto: DeactivateAccountDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        is_active: true,
        updated_at: true,
      },
    });
  }

  getSiteSettings() {
    return {
      darkMode: false,
      language: 'en',
      timezone: 'UTC',
      notificationsEnabled: true,
    };
  }

  async updateSiteSettings(userId: string, dto: UpdateSiteSettingsDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: {
        darkMode: dto.darkMode ?? false,
        language: dto.language ?? 'en',
        timezone: dto.timezone ?? 'UTC',
        notificationsEnabled: dto.notificationsEnabled ?? true,
      },
    };
  }
}
