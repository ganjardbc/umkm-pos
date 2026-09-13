import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { OutletHeaderGuard } from '../common/guards/outlet-header.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notification')
@UseGuards(PermissionGuard, OutletHeaderGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermission('notification.read')
  @ApiOperation({ summary: 'Get notifications list' })
  @ApiResponse({
    status: 200,
    description: 'Notifications fetched successfully',
  })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('outlet_id') outletId: string,
    @Query() query: ListNotificationsDto,
  ) {
    return this.notificationsService.findAll(
      userId,
      merchantId,
      outletId,
      query,
    );
  }

  @Get(':id')
  @RequirePermission('notification.read')
  @ApiOperation({ summary: 'Get notification detail' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('outlet_id') outletId: string,
  ) {
    return this.notificationsService.findOne(id, userId, merchantId, outletId);
  }

  @Patch(':id/read')
  @RequirePermission('notification.update')
  @ApiOperation({ summary: 'Mark one notification as read' })
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('outlet_id') outletId: string,
  ) {
    return this.notificationsService.markAsRead(
      id,
      userId,
      merchantId,
      outletId,
    );
  }

  @Patch('read-all')
  @RequirePermission('notification.update')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(
    @CurrentUser('id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('outlet_id') outletId: string,
  ) {
    return this.notificationsService.markAllAsRead(
      userId,
      merchantId,
      outletId,
    );
  }
}
