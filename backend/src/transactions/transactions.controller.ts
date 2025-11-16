import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user transactions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async findAll(@CurrentUser('id') userId: string, @Query('limit') limit: number = 50) {
    const transactions = await this.transactionsService.findAllByUser(userId, limit);
    return { data: transactions };
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get transactions by account' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async findByAccount(
    @Param('accountId') accountId: string,
    @CurrentUser('id') userId: string,
    @Query('limit') limit: number = 50,
  ) {
    const transactions = await this.transactionsService.findAllByAccount(accountId, userId, limit);
    return { data: transactions };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const transaction = await this.transactionsService.findById(id, userId);
    return { data: transaction };
  }
}
