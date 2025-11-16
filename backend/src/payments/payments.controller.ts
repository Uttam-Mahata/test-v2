import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { MakePaymentDto } from './dto/make-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer funds between accounts' })
  @ApiResponse({ status: 200, description: 'Transfer completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid PIN' })
  async transferFunds(@CurrentUser('id') userId: string, @Body() transferFundsDto: TransferFundsDto) {
    return this.paymentsService.transferFunds(
      userId,
      transferFundsDto.fromAccountType,
      transferFundsDto.toAccountType,
      transferFundsDto.amount,
      transferFundsDto.pin,
      transferFundsDto.description,
    );
  }

  @Post('external')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Make external payment' })
  @ApiResponse({ status: 200, description: 'Payment completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid PIN' })
  async makePayment(@CurrentUser('id') userId: string, @Body() makePaymentDto: MakePaymentDto) {
    return this.paymentsService.makePayment(
      userId,
      makePaymentDto.accountType,
      makePaymentDto.amount,
      makePaymentDto.recipient,
      makePaymentDto.pin,
      makePaymentDto.description,
    );
  }
}
