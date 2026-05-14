import {
  Controller,
  Get,
  Post,
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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { FindAllTransactionsDto } from './dto/find-all-transactions.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(PermissionGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @RequirePermission('transaction.create')
  @ApiOperation({ summary: 'Create a new transaction (POS checkout) — atomic' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully with items',
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock, invalid items, or shift not available',
  })
  @ApiResponse({
    status: 403,
    description: 'User not a participant in shift or insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Product, outlet, or shift not found',
  })
  create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.create(dto, merchantId, userId);
  }

  @Get()
  @RequirePermission('transaction.read')
  @ApiOperation({
    summary: 'List all transactions (merchant-scoped, optionally by outlet)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all transactions with items',
  })
  findAll(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() query: FindAllTransactionsDto,
  ) {
    return this.transactionsService.findAll(
      merchantId,
      query.outlet_id,
      query.is_cancelled,
      query,
    );
  }

  @Get(':id')
  @RequirePermission('transaction.read')
  @ApiOperation({
    summary: 'Get transaction by ID (merchant-scoped, includes items)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return transaction details with items',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.transactionsService.findOne(id, merchantId);
  }

  @Post(':id/cancel')
  @RequirePermission('transaction.cancel')
  @ApiOperation({ summary: 'Cancel a transaction and restore stock' })
  @ApiResponse({
    status: 200,
    description: 'Transaction cancelled successfully with stock restored',
  })
  @ApiResponse({ status: 400, description: 'Transaction already cancelled' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelTransactionDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.cancel(id, merchantId, userId);
  }
}
