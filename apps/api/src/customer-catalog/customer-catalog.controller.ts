import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CustomerCatalogService } from './customer-catalog.service';
import { StartCustomerSessionDto } from './dto/start-customer-session.dto';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';

@ApiTags('Customer Catalog')
@Controller()
@Public()
export class CustomerCatalogController {
  constructor(
    private readonly customerCatalogService: CustomerCatalogService,
  ) {}

  @Post('customer-sessions/start')
  @ApiOperation({ summary: 'Start guest customer session' })
  startSession(@Body() dto: StartCustomerSessionDto) {
    return this.customerCatalogService.startSession(dto);
  }

  @Get('catalog/session/me')
  @ApiOperation({ summary: 'Get current customer session' })
  getSession(@Headers('x-customer-session-token') sessionToken: string) {
    return this.customerCatalogService.getSession(sessionToken);
  }

  @Get('catalog/session/status')
  @ApiOperation({ summary: 'Get current session status for polling' })
  getSessionStatus(@Headers('x-customer-session-token') sessionToken: string) {
    return this.customerCatalogService.getSessionStatus(sessionToken);
  }

  @Get('catalog/shift-status')
  @ApiOperation({ summary: 'Get current open shift status for outlet' })
  getShiftStatus(@Query('outlet_id') outletId: string) {
    return this.customerCatalogService.getShiftStatus(outletId);
  }

  @Get('catalog/categories')
  @ApiOperation({ summary: 'List active categories for customer catalog' })
  listCategories(@Query('outlet_id') outletId: string) {
    return this.customerCatalogService.listCategories(outletId);
  }

  @Get('catalog/products')
  @ApiOperation({ summary: 'List products for customer catalog' })
  listProducts(@Query() query: CatalogProductsQueryDto) {
    return this.customerCatalogService.listProducts(query);
  }

  @Get('catalog/tables')
  @ApiOperation({ summary: 'List active store tables for outlet' })
  listTables(@Query('outlet_id') outletId: string) {
    return this.customerCatalogService.listTables(outletId);
  }

  @Post('catalog/orders')
  @ApiOperation({ summary: 'Create customer catalog order' })
  createOrder(
    @Headers('x-customer-session-token') sessionToken: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.customerCatalogService.createOrder(sessionToken, dto);
  }

  @Get('catalog/orders/:id')
  @ApiOperation({ summary: 'Get customer catalog order detail' })
  getOrder(
    @Headers('x-customer-session-token') sessionToken: string,
    @Param('id') id: string,
  ) {
    return this.customerCatalogService.getOrder(sessionToken, id);
  }
}
