import { bankingService } from './banking.service';
import { User, Account, Transaction, Loan } from '../types/types';

/**
 * Adapter that wraps the real backend banking service to match
 * the interface expected by AssistantUI (previously using mockBankingApi)
 */
class BankingApiAdapter {
  private accountsCache: Account[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  /**
   * Fetch and cache accounts to enable type-to-ID mapping
   */
  private async getAccountsFromBackend(): Promise<Account[]> {
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
   * Find account by type
   */
  private async findAccountByType(accountType: string): Promise<Account | undefined> {
    const accounts = await this.getAccountsFromBackend();
    return accounts.find(acc => acc.type === accountType);
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
      return await this.getAccountsFromBackend();
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

      const transactions = await bankingService.getTransactionsByAccount(account.id);
      return transactions;
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
          const loans = await bankingService.getActiveLoans();
          return loans;
        }

        case 'credit_limit': {
          const accounts = await this.getAccountsFromBackend();
          const creditAccounts = accounts.filter(a => a.type === 'credit');
          return creditAccounts;
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
      const result = await bankingService.transferFunds({
        fromAccountType: fromAccountType as 'checking' | 'savings' | 'credit',
        toAccountType: toAccountType as 'checking' | 'savings' | 'credit',
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
        confirmationNumber: result.transaction?.id || result.confirmationNumber,
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
