import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OutletsService } from './outlets.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { SetOutletImageDto } from './dto/set-outlet-image.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Outlets')
@ApiBearerAuth()
@Controller('outlets')
@UseGuards(PermissionGuard)
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Post()
  @RequirePermission('outlet.create')
  @ApiOperation({ summary: 'Create a new outlet for the current merchant' })
  @ApiResponse({ status: 201, description: 'Outlet created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Slug already exists for this merchant',
  })
  create(
    @Body() dto: CreateOutletDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.outletsService.create(dto, merchantId, userId);
  }

  @Get()
  @RequirePermission('outlet.read')
  @ApiOperation({ summary: 'List all outlets for the current merchant' })
  @ApiResponse({ status: 200, description: 'Return all outlets (paginated)' })
  findAll(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.outletsService.findAll(merchantId, pagination);
  }

  @Get(':id')
  @RequirePermission('outlet.read')
  @ApiOperation({ summary: 'Get outlet by ID (merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'Return outlet details' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.outletsService.findOne(id, merchantId);
  }

  @Patch(':id')
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Update outlet details (merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'Outlet updated successfully' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  @ApiResponse({
    status: 409,
    description: 'Slug already exists for this merchant',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOutletDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.outletsService.update(id, dto, merchantId, userId);
  }

  @Delete(':id')
  @RequirePermission('outlet.delete')
  @ApiOperation({ summary: 'Delete an outlet (merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'Outlet deleted successfully' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.outletsService.remove(id, merchantId);
  }

  @Patch(':id/image')
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Set outlet logo from an uploaded file' })
  @ApiResponse({ status: 200, description: 'Outlet logo set successfully' })
  @ApiResponse({ status: 404, description: 'Outlet or upload not found' })
  setImage(
    @Param('id') id: string,
    @Body() dto: SetOutletImageDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.outletsService.setImage(id, dto.upload_id, merchantId, userId);
  }

  @Delete(':id/image')
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Remove outlet logo' })
  @ApiResponse({ status: 200, description: 'Outlet logo removed successfully' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  removeImage(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.outletsService.removeImage(id, merchantId, userId);
  }
}
