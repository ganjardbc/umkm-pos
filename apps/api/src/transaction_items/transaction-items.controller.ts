import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionItemsService } from './transaction-items.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@ApiTags('Transaction Items')
@ApiBearerAuth()
@Controller('transactions/:transactionId/items')
@UseGuards(PermissionGuard)
export class TransactionItemsController {
  constructor(
    private readonly transactionItemsService: TransactionItemsService,
  ) {}

  @Get()
  @RequirePermission('transaction.read')
  @ApiOperation({
    summary: 'List all items for a transaction (merchant-scoped)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all items for the transaction',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findByTransaction(
    @Param('transactionId') transactionId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.transactionItemsService.findByTransaction(
      transactionId,
      merchantId,
    );
  }
}
