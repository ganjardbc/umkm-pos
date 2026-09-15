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
import { AdminOutletsService } from './admin-outlets.service';
import {
  AdminCreateOutletDto,
  AdminOutletsQueryDto,
} from './dto/admin-outlets.dto';
import { UpdateOutletDto } from '../../outlets/dto/update-outlet.dto';
import { SetOutletImageDto } from '../../outlets/dto/set-outlet-image.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';

@ApiTags('Admin - Outlets')
@ApiBearerAuth()
@Controller('admin/outlets')
@UseGuards(AdminGuard, PermissionGuard)
export class AdminOutletsController {
  constructor(private readonly outletsService: AdminOutletsService) {}

  @Post()
  @RequirePermission('outlet.create')
  @ApiOperation({ summary: 'Create an outlet for any merchant' })
  @ApiResponse({ status: 201, description: 'Outlet created successfully' })
  @ApiResponse({ status: 400, description: 'Merchant not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  create(@Body() dto: AdminCreateOutletDto, @CurrentUser('id') userId: string) {
    return this.outletsService.create(dto, userId);
  }

  @Get()
  @RequirePermission('outlet.read')
  @ApiOperation({ summary: 'List outlets across merchants' })
  @ApiResponse({ status: 200, description: 'Return outlets (paginated)' })
  findAll(@Query() query: AdminOutletsQueryDto) {
    return this.outletsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('outlet.read')
  @ApiOperation({ summary: 'Get outlet by ID' })
  @ApiResponse({ status: 200, description: 'Return outlet details' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  findOne(@Param('id') id: string) {
    return this.outletsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Update outlet details' })
  @ApiResponse({ status: 200, description: 'Outlet updated successfully' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOutletDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.outletsService.update(id, dto, userId);
  }

  @Delete(':id')
  @RequirePermission('outlet.delete')
  @ApiOperation({ summary: 'Delete an outlet' })
  @ApiResponse({ status: 200, description: 'Outlet deleted successfully' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  remove(@Param('id') id: string) {
    return this.outletsService.remove(id);
  }

  @Patch(':id/image')
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Set outlet logo from an uploaded file' })
  @ApiResponse({ status: 200, description: 'Outlet logo set successfully' })
  @ApiResponse({ status: 404, description: 'Outlet or upload not found' })
  setImage(
    @Param('id') id: string,
    @Body() dto: SetOutletImageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.outletsService.setImage(id, dto.upload_id, userId);
  }

  @Delete(':id/image')
  @RequirePermission('outlet.update')
  @ApiOperation({ summary: 'Remove outlet logo' })
  @ApiResponse({ status: 200, description: 'Outlet logo removed' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  removeImage(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.outletsService.removeImage(id, userId);
  }
}
