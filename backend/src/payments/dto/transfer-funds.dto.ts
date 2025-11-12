import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, Min, Matches, IsOptional } from 'class-validator';
import { AccountType } from '../../database/entities/account.entity';

export class TransferFundsDto {
  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  @IsEnum(AccountType)
  fromAccountType: AccountType;

  @ApiProperty({ enum: AccountType, example: AccountType.SAVINGS })
  @IsEnum(AccountType)
  toAccountType: AccountType;

  @ApiProperty({ example: 100.50 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be 4 digits' })
  pin: string;

  @ApiProperty({ example: 'Transfer to savings', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
