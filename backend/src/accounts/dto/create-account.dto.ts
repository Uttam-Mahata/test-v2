import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { AccountType } from '../../database/entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({
    enum: AccountType,
    example: AccountType.CHECKING,
    description: 'Type of account to create',
  })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    example: 1000,
    required: false,
    description: 'Initial balance (optional, default: 0)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number;
}
