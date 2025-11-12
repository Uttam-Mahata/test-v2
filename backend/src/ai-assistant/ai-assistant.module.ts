import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantGateway } from './ai-assistant.gateway';
import { AiAssistantController } from './ai-assistant.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PaymentsModule } from '../payments/payments.module';
import { LoansModule } from '../loans/loans.module';

@Module({
  imports: [ConfigModule, AccountsModule, TransactionsModule, PaymentsModule, LoansModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService, AiAssistantGateway],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
