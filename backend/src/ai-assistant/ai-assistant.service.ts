import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { PaymentsService } from '../payments/payments.service';
import { LoansService } from '../loans/loans.service';
import { AccountType } from '../database/entities/account.entity';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private genAI: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    private accountsService: AccountsService,
    private transactionsService: TransactionsService,
    private paymentsService: PaymentsService,
    private loansService: LoansService,
  ) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  getSystemInstruction(): string {
    return `You are a helpful AI financial assistant for a banking application. You help users with:
- Checking account balances
- Viewing transaction history
- Making payments and fund transfers
- Inquiring about loans and interest rates
- Setting reminders and alerts

Always be polite, professional, and ensure user data privacy. When handling financial operations:
1. Verify user intent clearly
2. Confirm transaction details
3. Request PIN verification for sensitive operations
4. Provide clear confirmations after operations

Use the available tools to fetch real-time data and perform operations.`;
  }

  getFunctionDeclarations(): any[] {
    return [
      {
        name: 'getAccountBalance',
        description: 'Get the balance of a specific account type',
        parameters: {
          type: 'object',
          properties: {
            accountType: {
              type: 'string',
              enum: ['checking', 'savings', 'credit'],
              description: 'Type of account',
            },
          },
          required: ['accountType'],
        },
      },
      {
        name: 'getTransactionHistory',
        description: 'Get recent transaction history for an account',
        parameters: {
          type: 'object',
          properties: {
            accountType: {
              type: 'string',
              enum: ['checking', 'savings', 'credit'],
              description: 'Type of account',
            },
            limit: {
              type: 'number',
              description: 'Number of transactions to retrieve (default: 10)',
            },
          },
          required: ['accountType'],
        },
      },
      {
        name: 'transferFunds',
        description: 'Transfer funds between user accounts (requires PIN verification)',
        parameters: {
          type: 'object',
          properties: {
            fromAccount: {
              type: 'string',
              enum: ['checking', 'savings', 'credit'],
              description: 'Source account type',
            },
            toAccount: {
              type: 'string',
              enum: ['checking', 'savings', 'credit'],
              description: 'Destination account type',
            },
            amount: {
              type: 'number',
              description: 'Amount to transfer',
            },
          },
          required: ['fromAccount', 'toAccount', 'amount'],
        },
      },
      {
        name: 'getFinancialProductsInfo',
        description: 'Get information about loans, credit limits, or interest rates',
        parameters: {
          type: 'object',
          properties: {
            productType: {
              type: 'string',
              enum: ['loans', 'credit_limit', 'interest_rates'],
              description: 'Type of financial product',
            },
          },
          required: ['productType'],
        },
      },
    ];
  }

  async handleFunctionCall(functionName: string, args: any, userId: string): Promise<any> {
    this.logger.log(`Handling function call: ${functionName} for user ${userId}`);

    try {
      switch (functionName) {
        case 'getAccountBalance':
          return await this.handleGetAccountBalance(userId, args.accountType);

        case 'getTransactionHistory':
          return await this.handleGetTransactionHistory(
            userId,
            args.accountType,
            args.limit || 10,
          );

        case 'getFinancialProductsInfo':
          return await this.handleGetFinancialProductsInfo(userId, args.productType);

        case 'transferFunds':
          // This will be handled with PIN verification in the gateway/client
          return {
            requiresPin: true,
            transferDetails: {
              fromAccount: args.fromAccount,
              toAccount: args.toAccount,
              amount: args.amount,
            },
          };

        default:
          return { error: `Unknown function: ${functionName}` };
      }
    } catch (error) {
      this.logger.error(`Error handling function ${functionName}:`, error);
      return { error: error.message };
    }
  }

  private async handleGetAccountBalance(userId: string, accountType: string): Promise<any> {
    const account = await this.accountsService.findByType(
      userId,
      accountType as AccountType,
    );
    return {
      balance: account.balance,
      currency: account.currency,
      accountType: account.type,
    };
  }

  private async handleGetTransactionHistory(
    userId: string,
    accountType: string,
    limit: number,
  ): Promise<any> {
    const account = await this.accountsService.findByType(
      userId,
      accountType as AccountType,
    );
    const transactions = await this.transactionsService.findAllByAccount(
      account.id,
      userId,
      limit,
    );
    return transactions;
  }

  private async handleGetFinancialProductsInfo(
    userId: string,
    productType: string,
  ): Promise<any> {
    switch (productType) {
      case 'loans':
        return await this.loansService.findAllByUser(userId);

      case 'credit_limit':
        const accounts = await this.accountsService.findAllByUser(userId);
        return accounts.filter((acc) => acc.type === AccountType.CREDIT);

      case 'interest_rates':
        return await this.loansService.getInterestRates();

      default:
        return { error: 'Unknown product type' };
    }
  }
}
