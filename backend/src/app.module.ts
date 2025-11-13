import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentsModule } from './payments/payments.module';
import { LoansModule } from './loans/loans.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { typeOrmConfig } from './config/typeorm.config';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{
          ttl: config.get('RATE_LIMIT_TTL', 60000),
          limit: config.get('RATE_LIMIT_MAX', 100),
        }],
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    PaymentsModule,
    LoansModule,
    AiAssistantModule,
  ],
})
export class AppModule {}
