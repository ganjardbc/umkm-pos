import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FindNotificationsDto } from './dto/find-notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notification')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications with pagination and unread filter' })
  @ApiResponse({ status: 200, description: 'Notifications fetched successfully' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: FindNotificationsDto,
  ) {
    return this.notificationsService.findAll(userId, merchantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification detail by ID' })
  @ApiResponse({ status: 200, description: 'Notification detail fetched successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.notificationsService.findOne(id, userId, merchantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId, merchantId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all user-scoped notifications as read' })
  markAllAsRead(
    @CurrentUser('id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.notificationsService.markAllAsRead(userId, merchantId);
  }
}
