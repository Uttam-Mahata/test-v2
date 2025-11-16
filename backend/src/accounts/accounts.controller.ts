import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async create(@CurrentUser('id') userId: string, @Body() createAccountDto: CreateAccountDto) {
    const account = await this.accountsService.create(
      userId,
      createAccountDto.type,
      createAccountDto.initialBalance,
    );
    return {
      data: account,
      message: 'Account created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all user accounts' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  async findAll(@CurrentUser('id') userId: string) {
    const accounts = await this.accountsService.findAllByUser(userId);
    return { data: accounts };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const account = await this.accountsService.findById(id, userId);
    return { data: account };
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getBalance(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const balance = await this.accountsService.getBalance(id, userId);
    return {
      data: { balance },
      message: 'Balance retrieved successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  async deactivate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.accountsService.deactivate(id, userId);
    return { message: 'Account deactivated successfully' };
  }
}
