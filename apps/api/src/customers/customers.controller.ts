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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  CustomersQueryDto,
  UpdateCustomerDto,
} from './dto/customer.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(PermissionGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermission('customer.read')
  @ApiOperation({ summary: 'List customers (search by name or phone)' })
  findAll(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() query: CustomersQueryDto,
  ) {
    return this.customersService.findAll(merchantId, query);
  }

  @Get(':id')
  @RequirePermission('customer.read')
  @ApiOperation({ summary: 'Customer with lifetime totals and recent visits' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.customersService.findOne(id, merchantId);
  }

  @Post()
  @RequirePermission('customer.create')
  @ApiOperation({ summary: 'Register a customer' })
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.customersService.create(dto, merchantId, userId);
  }

  @Patch(':id')
  @RequirePermission('customer.update')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.customersService.update(id, dto, merchantId, userId);
  }

  @Delete(':id')
  @RequirePermission('customer.delete')
  @ApiOperation({
    summary: 'Delete a customer (past transactions keep their snapshot)',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.customersService.remove(id, merchantId);
  }
}
