import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('loans')
@Controller('loans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user loans' })
  @ApiResponse({ status: 200, description: 'Loans retrieved successfully' })
  async findAll(@CurrentUser('id') userId: string) {
    const loans = await this.loansService.findAllByUser(userId);
    return { data: loans };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active loans' })
  @ApiResponse({ status: 200, description: 'Active loans retrieved successfully' })
  async findActive(@CurrentUser('id') userId: string) {
    const loans = await this.loansService.findActiveLoans(userId);
    return { data: loans };
  }

  @Get('interest-rates')
  @ApiOperation({ summary: 'Get current interest rates' })
  @ApiResponse({ status: 200, description: 'Interest rates retrieved successfully' })
  async getInterestRates() {
    const rates = await this.loansService.getInterestRates();
    return { data: rates };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan by ID' })
  @ApiResponse({ status: 200, description: 'Loan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const loan = await this.loansService.findById(id, userId);
    return { data: loan };
  }
}
