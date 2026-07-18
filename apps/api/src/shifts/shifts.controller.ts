import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { HandoffShiftDto } from './dto/handoff-shift.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@ApiTags('Shifts')
@ApiBearerAuth()
@Controller('shifts')
@UseGuards(PermissionGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  /**
   * Legacy endpoints (kept for backward compatibility)
   */

  @Get('user/:user_id')
  @RequirePermission('shift.read')
  @ApiOperation({
    summary: 'Get shift by User ID (merchant-scoped, includes transactions)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return shift details with transactions',
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  findByUser(
    @Param('user_id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.shiftsService.findByUser(userId, merchantId);
  }

  @Get('outlet/:outlet_id')
  @RequirePermission('shift.read')
  @ApiOperation({
    summary: 'Get shift by Outlet ID (merchant-scoped, includes transactions)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return shift details with transactions',
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  findByOutlet(
    @Param('outlet_id') outletId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.shiftsService.findByOutlet(outletId, merchantId);
  }

  /**
   * New multi-cashier endpoints
   */

  @Post()
  @RequirePermission('shift.create')
  @ApiOperation({ summary: 'Open a new multi-cashier shift' })
  @ApiResponse({ status: 201, description: 'Shift opened successfully' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  @ApiResponse({
    status: 409,
    description: 'User already has an open shift at this outlet',
  })
  async openShift(
    @Body() dto: CreateShiftDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shiftsService.openShift(dto.outlet_id, userId, merchantId);
  }

  @Get()
  @RequirePermission('shift.read')
  @ApiOperation({ summary: 'Query shifts with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Return filtered shifts' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async queryShifts(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() query: QueryShiftsDto,
  ) {
    const filters = {
      outlet_id: query.outlet_id,
      status: query.status,
      start_date: query.start_date ? new Date(query.start_date) : undefined,
      end_date: query.end_date ? new Date(query.end_date) : undefined,
      user_id: query.user_id,
      limit: query.limit,
      offset: query.skip,
    };

    return this.shiftsService.queryShifts(merchantId, filters);
  }

  @Get(':id')
  @RequirePermission('shift.read')
  @ApiOperation({ summary: 'Get shift details with participants' })
  @ApiResponse({
    status: 200,
    description: 'Return shift details with participants',
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getShift(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.shiftsService.getShift(id, merchantId);
  }

  @Patch(':id/close')
  @RequirePermission('shift.update')
  @ApiOperation({ summary: 'Close a multi-cashier shift' })
  @ApiResponse({ status: 200, description: 'Shift closed successfully' })
  @ApiResponse({ status: 400, description: 'Shift is already closed' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async closeShift(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shiftsService.closeShift(id, userId, merchantId);
  }

  @Get(':id/participants')
  @RequirePermission('shift.read')
  @ApiOperation({ summary: 'Get shift participants' })
  @ApiResponse({ status: 200, description: 'Return list of participants' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getShiftParticipants(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.shiftsService.getShiftParticipants(id, merchantId);
  }

  @Post(':id/participants')
  @RequirePermission('shift.update')
  @ApiOperation({ summary: 'Add cashier to shift' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiResponse({ status: 400, description: 'Shift closed or invalid request' })
  @ApiResponse({ status: 404, description: 'Shift or user not found' })
  @ApiResponse({ status: 409, description: 'User already a participant' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async addParticipant(
    @Param('id') id: string,
    @Body() dto: AddParticipantDto,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.shiftsService.addParticipant(id, dto.user_id, merchantId);
  }

  @Delete(':id/participants/:user_id')
  @RequirePermission('shift.update')
  @ApiOperation({ summary: 'Remove cashier from shift' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove last participant' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async removeParticipant(
    @Param('id') id: string,
    @Param('user_id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.shiftsService.removeParticipant(id, userId, merchantId);
  }

  @Patch(':id/participants/:user_id/restore')
  @RequirePermission('shift.update')
  @ApiOperation({ summary: 'Restore removed cashier to shift' })
  @ApiResponse({
    status: 200,
    description: 'Participant restored successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shift closed or participant already active',
  })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  @ApiResponse({ status: 409, description: 'Participant is already active' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async restoreParticipant(
    @Param('id') id: string,
    @Param('user_id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.shiftsService.restoreParticipant(id, userId, merchantId);
  }

  @Post(':id/handoff')
  @RequirePermission('shift.update')
  @ApiOperation({ summary: 'Transfer shift ownership' })
  @ApiResponse({ status: 200, description: 'Shift handed off successfully' })
  @ApiResponse({ status: 400, description: 'Invalid handoff request' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 403, description: 'Not shift owner' })
  async handoffShift(
    @Param('id') id: string,
    @Body() dto: HandoffShiftDto,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.shiftsService.handoffShift(
      id,
      dto.target_user_id,
      dto.remove_previous_owner || false,
      merchantId,
    );
  }
}
