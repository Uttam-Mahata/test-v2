import { bankingService, Account as BankingAccount, Transaction as BankingTransaction, Loan as BankingLoan } from './banking.service';
import { User, Account, Transaction, Loan } from '../types/types';

/**
 * Adapter that wraps the real backend banking service to match
 * the interface expected by AssistantUI (previously using mockBankingApi)
 */
class BankingApiAdapter {
  private accountsCache: BankingAccount[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  /**
   * Fetch and cache accounts to enable type-to-ID mapping
   */
  private async getAccountsFromBackend(): Promise<BankingAccount[]> {
    const now = Date.now();
    if (this.accountsCache.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.accountsCache;
    }

    try {
      this.accountsCache = await bankingService.getAccounts();
      this.lastFetch = now;
      return this.accountsCache;
    } catch (error) {
      console.error('Failed to fetch accounts from backend:', error);
      throw error;
    }
  }

  /**
   * Convert backend account format to UI account format
   */
  private mapAccount(backendAccount: BankingAccount): Account {
    return {
      id: backendAccount.id,
      userId: backendAccount.userId,
      type: backendAccount.accountType,
      balance: backendAccount.balance,
      currency: backendAccount.currency as 'USD',
      limit: backendAccount.accountType === 'credit' ? 10000 : undefined, // You may need to get this from backend
    };
  }

  /**
   * Convert backend transaction format to UI transaction format
   */
  private mapTransaction(backendTx: BankingTransaction): Transaction {
    return {
      id: backendTx.id,
      accountId: backendTx.accountId,
      date: backendTx.timestamp,
      description: backendTx.description,
      amount: backendTx.amount,
      type: backendTx.type,
    };
  }

  /**
   * Convert backend loan format to UI loan format
   */
  private mapLoan(backendLoan: BankingLoan): Loan {
    return {
      id: backendLoan.id,
      userId: backendLoan.userId,
      type: backendLoan.loanType,
      principal: backendLoan.principal,
      interestRate: backendLoan.interestRate,
      remainingBalance: backendLoan.remainingBalance,
      nextPaymentDate: backendLoan.nextPaymentDate,
      nextPaymentAmount: backendLoan.monthlyPayment,
    };
  }

  /**
   * Find account by type
   */
  private async findAccountByType(accountType: string): Promise<BankingAccount | undefined> {
    const accounts = await this.getAccountsFromBackend();
    return accounts.find(acc => acc.accountType === accountType);
  }

  /**
   * Not used with real backend (auth is handled by tokens)
   * Kept for interface compatibility
   */
  async authenticate(userId: string): Promise<User | null> {
    console.warn('authenticate() is not needed with real backend - using token auth');
    return null;
  }

  /**
   * Get all accounts for the authenticated user
   */
  async getAccounts(userId: string): Promise<Account[]> {
    try {
      const backendAccounts = await this.getAccountsFromBackend();
      return backendAccounts.map(acc => this.mapAccount(acc));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  }

  /**
   * Get transactions for a specific account type
   */
  async getTransactions(userId: string, accountType: string): Promise<Transaction[] | { error: string }> {
    try {
      const account = await this.findAccountByType(accountType);
      if (!account) {
        return { error: `Account type '${accountType}' not found.` };
      }

      const backendTransactions = await bankingService.getTransactionsByAccount(account.id);
      return backendTransactions.map(tx => this.mapTransaction(tx));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { error: 'Failed to fetch transactions' };
    }
  }

  /**
   * Get financial products information (loans, credit limits, interest rates)
   */
  async getFinancialProductsInfo(
    userId: string,
    productType: 'loans' | 'credit_limit' | 'interest_rates'
  ): Promise<any> {
    try {
      switch (productType) {
        case 'loans': {
          const backendLoans = await bankingService.getActiveLoans();
          return backendLoans.map(loan => this.mapLoan(loan));
        }

        case 'credit_limit': {
          const accounts = await this.getAccountsFromBackend();
          const creditAccounts = accounts.filter(a => a.accountType === 'credit');
          return creditAccounts.map(acc => this.mapAccount(acc));
        }

        case 'interest_rates': {
          const rates = await bankingService.getInterestRates();
          // Convert backend format to UI format
          const formattedRates: { [key: string]: string } = {};
          Object.entries(rates).forEach(([key, value]) => {
            formattedRates[key] = typeof value === 'object' ?
              `${value.rate}% - ${value.description}` :
              String(value);
          });
          return formattedRates;
        }

        default:
          return { error: 'Unknown product type' };
      }
    } catch (error) {
      console.error('Error fetching financial products info:', error);
      return { error: 'Failed to fetch financial products information' };
    }
  }

  /**
   * Transfer funds between accounts
   */
  async transferFunds(
    userId: string,
    fromAccountType: string,
    toAccountType: string,
    amount: number,
    pin: string
  ): Promise<{ success: boolean; message: string; confirmationNumber?: string }> {
    try {
      const fromAccount = await this.findAccountByType(fromAccountType);
      const toAccount = await this.findAccountByType(toAccountType);

      if (!fromAccount || !toAccount) {
        return {
          success: false,
          message: 'One or both accounts not found.'
        };
      }

      const result = await bankingService.transferFunds({
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount,
        description: `Transfer from ${fromAccountType} to ${toAccountType}`,
        pin,
      });

      // Invalidate cache after successful transfer
      if (result.success) {
        this.accountsCache = [];
        this.lastFetch = 0;
      }

      return {
        success: result.success,
        message: result.message,
        confirmationNumber: result.transaction?.id,
      };
    } catch (error: any) {
      console.error('Error transferring funds:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Transfer failed'
      };
    }
  }
}

export const bankingApi = new BankingApiAdapter();
