import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, Min, Matches, IsOptional } from 'class-validator';
import { AccountType } from '../../database/entities/account.entity';

export class MakePaymentDto {
  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  recipient: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be 4 digits' })
  pin: string;

  @ApiProperty({ example: 'Payment for services', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
