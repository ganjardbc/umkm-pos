import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(PermissionGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get user profile
   */
  @Get('profile')
  @RequirePermission('settings.profile.read')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.settingsService.getProfile(userId);
  }

  /**
   * Update user profile
   */
  @Put('profile')
  @RequirePermission('settings.profile.update')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.settingsService.updateProfile(userId, dto);
  }

  /**
   * Change password
   */
  @Put('password')
  @RequirePermission('settings.password.update')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password or mismatch' })
  @ApiResponse({ status: 404, description: 'User not found' })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.settingsService.changePassword(userId, dto);
  }

  /**
   * Request email verification
   */
  @Post('email/verify')
  @RequirePermission('settings.email.update')
  @ApiOperation({ summary: 'Request email verification code' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  requestEmailVerification(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyEmailDto,
  ) {
    return this.settingsService.requestEmailVerification(userId, dto);
  }

  /**
   * Update email with verification
   */
  @Put('email')
  @RequirePermission('settings.email.update')
  @ApiOperation({ summary: 'Update email with verification code' })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  updateEmail(@CurrentUser('id') userId: string, @Body() dto: ChangeEmailDto) {
    return this.settingsService.updateEmail(userId, dto);
  }

  /**
   * Deactivate account
   */
  @Post('account/deactivate')
  @RequirePermission('settings.account.deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivateAccount(
    @CurrentUser('id') userId: string,
    @Body() dto: DeactivateAccountDto,
  ) {
    return this.settingsService.deactivateAccount(userId, dto);
  }

  /**
   * Get site settings
   */
  @Get('site')
  @RequirePermission('settings.site.update')
  @ApiOperation({ summary: 'Get site settings' })
  @ApiResponse({ status: 200, description: 'Return site settings' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getSiteSettings() {
    return this.settingsService.getSiteSettings();
  }

  /**
   * Update site settings
   */
  @Put('site')
  @RequirePermission('settings.site.update')
  @ApiOperation({ summary: 'Update site settings' })
  @ApiResponse({
    status: 200,
    description: 'Site settings updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateSiteSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSiteSettingsDto,
  ) {
    return this.settingsService.updateSiteSettings(userId, dto);
  }
}
