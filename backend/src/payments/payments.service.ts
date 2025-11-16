import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AuthService } from '../auth/auth.service';
import { TransactionType } from '../database/entities/transaction.entity';
import { AccountType } from '../database/entities/account.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private accountsService: AccountsService,
    private transactionsService: TransactionsService,
    private authService: AuthService,
  ) {}

  async transferFunds(
    userId: string,
    fromAccountType: AccountType,
    toAccountType: AccountType,
    amount: number,
    pin: string,
    description: string = 'Internal transfer',
  ): Promise<any> {
    // Verify PIN
    const isPinValid = await this.authService.verifyPin(userId, pin);
    if (!isPinValid) {
      throw new UnauthorizedException('Invalid PIN');
    }

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    // Get accounts
    const fromAccount = await this.accountsService.findByType(userId, fromAccountType);
    const toAccount = await this.accountsService.findByType(userId, toAccountType);

    if (fromAccount.id === toAccount.id) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    // Check sufficient funds
    if (fromAccount.type !== AccountType.CREDIT && fromAccount.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    try {
      // Deduct from source account
      await this.accountsService.updateBalance(fromAccount.id, -amount);

      // Create debit transaction
      const debitTransaction = await this.transactionsService.create(
        fromAccount.id,
        TransactionType.DEBIT,
        amount,
        description,
        { toAccountId: toAccount.id, transferType: 'internal' },
      );

      // Add to destination account
      await this.accountsService.updateBalance(toAccount.id, amount);

      // Create credit transaction
      const creditTransaction = await this.transactionsService.create(
        toAccount.id,
        TransactionType.CREDIT,
        amount,
        description,
        { fromAccountId: fromAccount.id, transferType: 'internal' },
      );

      return {
        success: true,
        message: 'Transfer completed successfully',
        confirmationNumber: debitTransaction.referenceNumber,
        amount,
        fromAccount: {
          id: fromAccount.id,
          type: fromAccount.type,
          newBalance: (await this.accountsService.findById(fromAccount.id, userId)).balance,
        },
        toAccount: {
          id: toAccount.id,
          type: toAccount.type,
          newBalance: (await this.accountsService.findById(toAccount.id, userId)).balance,
        },
        transactions: {
          debit: debitTransaction,
          credit: creditTransaction,
        },
      };
    } catch (error) {
      // Rollback would be handled by database transactions in production
      throw new BadRequestException(error.message || 'Transfer failed');
    }
  }

  async makePayment(
    userId: string,
    accountType: AccountType,
    amount: number,
    recipient: string,
    pin: string,
    description: string = 'External payment',
  ): Promise<any> {
    // Verify PIN
    const isPinValid = await this.authService.verifyPin(userId, pin);
    if (!isPinValid) {
      throw new UnauthorizedException('Invalid PIN');
    }

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const account = await this.accountsService.findByType(userId, accountType);

    // Check sufficient funds
    if (account.type !== AccountType.CREDIT && account.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Deduct from account
    await this.accountsService.updateBalance(account.id, -amount);

    // Create transaction
    const transaction = await this.transactionsService.create(
      account.id,
      TransactionType.DEBIT,
      amount,
      description,
      { recipient, paymentType: 'external' },
    );

    return {
      success: true,
      message: 'Payment completed successfully',
      confirmationNumber: transaction.referenceNumber,
      amount,
      recipient,
      account: {
        id: account.id,
        type: account.type,
        newBalance: (await this.accountsService.findById(account.id, userId)).balance,
      },
      transaction,
    };
  }
}
