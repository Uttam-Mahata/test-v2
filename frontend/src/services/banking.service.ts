import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import { Account, Transaction, Loan, DataResponse, MessageResponse } from '../types/types';

export interface CreateAccountData {
  type: 'checking' | 'savings' | 'credit';
  initialBalance?: number;
}

export interface TransferData {
  fromAccountType: 'checking' | 'savings' | 'credit';
  toAccountType: 'checking' | 'savings' | 'credit';
  amount: number;
  pin: string;
  description?: string;
}

export interface ExternalPaymentData {
  accountType: 'checking' | 'savings' | 'credit';
  amount: number;
  recipient: string;
  pin: string;
  description?: string;
}

export const bankingService = {
  // Account operations
  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get<DataResponse<Account[]>>(
      API_ENDPOINTS.ACCOUNTS.BASE
    );
    return response.data;
  },

  async getAccountById(id: string): Promise<Account> {
    const response = await apiClient.get<DataResponse<Account>>(
      `${API_ENDPOINTS.ACCOUNTS.BASE}/${id}`
    );
    return response.data;
  },

  async getAccountBalance(id: string): Promise<{ balance: number }> {
    const response = await apiClient.get<DataResponse<{ balance: number }>>(
      API_ENDPOINTS.ACCOUNTS.BALANCE(id)
    );
    return response.data;
  },

  async createAccount(data: CreateAccountData): Promise<Account> {
    const response = await apiClient.post<DataResponse<Account>>(
      API_ENDPOINTS.ACCOUNTS.BASE,
      data
    );
    return response.data;
  },

  async deleteAccount(id: string): Promise<string> {
    const response = await apiClient.delete<MessageResponse>(
      `${API_ENDPOINTS.ACCOUNTS.BASE}/${id}`
    );
    return response.message;
  },

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get<DataResponse<Transaction[]>>(
      API_ENDPOINTS.TRANSACTIONS.BASE
    );
    return response.data;
  },

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    const response = await apiClient.get<DataResponse<Transaction[]>>(
      API_ENDPOINTS.TRANSACTIONS.BY_ACCOUNT(accountId)
    );
    return response.data;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await apiClient.get<DataResponse<Transaction>>(
      `${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`
    );
    return response.data;
  },

  // Payment operations
  async transferFunds(data: TransferData): Promise<{
    success: boolean;
    message: string;
    transaction?: Transaction;
    confirmationNumber?: string;
  }> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.TRANSFER, data);
  },

  async makeExternalPayment(data: ExternalPaymentData): Promise<{
    success: boolean;
    message: string;
    transaction?: Transaction;
    confirmationNumber?: string;
  }> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.EXTERNAL, data);
  },

  // Loan operations
  async getLoans(): Promise<Loan[]> {
    const response = await apiClient.get<DataResponse<Loan[]>>(
      API_ENDPOINTS.LOANS.BASE
    );
    return response.data;
  },

  async getActiveLoans(): Promise<Loan[]> {
    const response = await apiClient.get<DataResponse<Loan[]>>(
      API_ENDPOINTS.LOANS.ACTIVE
    );
    return response.data;
  },

  async getLoanById(id: string): Promise<Loan> {
    const response = await apiClient.get<DataResponse<Loan>>(
      `${API_ENDPOINTS.LOANS.BASE}/${id}`
    );
    return response.data;
  },

  async getInterestRates(): Promise<{
    [key: string]: { rate: number; description: string };
  }> {
    const response = await apiClient.get<DataResponse<{
      [key: string]: { rate: number; description: string };
    }>>(API_ENDPOINTS.LOANS.INTEREST_RATES);
    return response.data;
  },
};
