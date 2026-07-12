import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoreTablesService } from './store-tables.service';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateStoreTableDto } from './dto/create-store-table.dto';
import { UpdateStoreTableDto } from './dto/update-store-table.dto';

@ApiTags('Store Tables')
@ApiBearerAuth()
@Controller('outlets/:outletId/tables')
@UseGuards(PermissionGuard)
export class StoreTablesController {
  constructor(private readonly storeTablesService: StoreTablesService) {}

  @Get()
  @RequirePermission('outlet.read')
  @ApiOperation({ summary: 'List store tables for an outlet' })
  findAll(
    @Param('outletId') outletId: string,
    @CurrentUser('merchant_id') merchantId: string,
    @Query('active_only') activeOnly?: string,
  ) {
    return this.storeTablesService.findAll(
      merchantId,
      outletId,
      activeOnly === 'true',
    );
  }

  @Post()
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Create store table for an outlet' })
  create(
    @Param('outletId') outletId: string,
    @Body() dto: CreateStoreTableDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.storeTablesService.create(outletId, dto, merchantId, userId);
  }

  @Patch(':id')
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Update store table' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreTableDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.storeTablesService.update(id, dto, merchantId, userId);
  }

  @Delete(':id')
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Delete store table' })
  remove(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.storeTablesService.remove(id, merchantId);
  }
}
