import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  category?: string;
  recipientAccount?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  balance?: number;
}

export interface Loan {
  id: string;
  userId: string;
  loanType: 'auto' | 'personal' | 'mortgage' | 'business';
  principal: number;
  interestRate: number;
  termMonths: number;
  remainingBalance: number;
  monthlyPayment: number;
  nextPaymentDate: string;
  status: 'active' | 'paid-off' | 'defaulted';
  createdAt: string;
}

export interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  pin: string;
}

export interface ExternalPaymentData {
  fromAccountId: string;
  recipientAccount: string;
  recipientName: string;
  amount: number;
  description: string;
  pin: string;
}

export interface CreateAccountData {
  accountType: 'checking' | 'savings' | 'credit';
  initialDeposit?: number;
}

export const bankingService = {
  // Account operations
  async getAccounts(): Promise<Account[]> {
    return apiClient.get<Account[]>(API_ENDPOINTS.ACCOUNTS.BASE);
  },

  async getAccountById(id: string): Promise<Account> {
    return apiClient.get<Account>(`${API_ENDPOINTS.ACCOUNTS.BASE}/${id}`);
  },

  async getAccountBalance(id: string): Promise<{ balance: number; currency: string }> {
    return apiClient.get<{ balance: number; currency: string }>(
      API_ENDPOINTS.ACCOUNTS.BALANCE(id)
    );
  },

  async createAccount(data: CreateAccountData): Promise<Account> {
    return apiClient.post<Account>(API_ENDPOINTS.ACCOUNTS.BASE, data);
  },

  async deleteAccount(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${API_ENDPOINTS.ACCOUNTS.BASE}/${id}`
    );
  },

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>(API_ENDPOINTS.TRANSACTIONS.BASE);
  },

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>(
      API_ENDPOINTS.TRANSACTIONS.BY_ACCOUNT(accountId)
    );
  },

  async getTransactionById(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(
      `${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`
    );
  },

  // Payment operations
  async transferFunds(data: TransferData): Promise<{
    success: boolean;
    message: string;
    transaction?: Transaction;
  }> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.TRANSFER, data);
  },

  async makeExternalPayment(data: ExternalPaymentData): Promise<{
    success: boolean;
    message: string;
    transaction?: Transaction;
  }> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.EXTERNAL, data);
  },

  // Loan operations
  async getLoans(): Promise<Loan[]> {
    return apiClient.get<Loan[]>(API_ENDPOINTS.LOANS.BASE);
  },

  async getActiveLoans(): Promise<Loan[]> {
    return apiClient.get<Loan[]>(API_ENDPOINTS.LOANS.ACTIVE);
  },

  async getLoanById(id: string): Promise<Loan> {
    return apiClient.get<Loan>(`${API_ENDPOINTS.LOANS.BASE}/${id}`);
  },

  async getInterestRates(): Promise<{
    [key: string]: { rate: number; description: string };
  }> {
    return apiClient.get(API_ENDPOINTS.LOANS.INTEREST_RATES);
  },
};
