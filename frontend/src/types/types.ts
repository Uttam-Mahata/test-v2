// User types - matches backend User entity
export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Account types - matches backend Account entity
export interface Account {
  id: string;
  userId: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  balance: number;
  limit?: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction types - matches backend Transaction entity
export interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  referenceNumber: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  fromAccountId?: string;
  toAccountId?: string;
  metadata?: any;
  createdAt: Date;
}

// Loan types - matches backend Loan entity
export interface Loan {
  id: string;
  userId: string;
  type: 'personal' | 'auto' | 'mortgage' | 'business';
  loanNumber: string;
  principal: number;
  interestRate: number;
  remainingBalance: number;
  nextPaymentDate: Date;
  nextPaymentAmount: number;
  termMonths: number;
  status: 'active' | 'paid_off' | 'defaulted' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// Auth response types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  message: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

// API response wrappers
export interface DataResponse<T> {
  data: T;
  message?: string;
}

export interface MessageResponse {
  message: string;
  [key: string]: any;
}

// Financial info aggregates
export interface FinancialInfo {
  loans?: Loan[];
  creditAccounts?: Account[];
  interestRates?: { [key: string]: string };
}

// Assistant types
export enum AssistantStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR',
}

export interface ChatMessage {
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: string;
  transactions?: Transaction[];
  financialInfo?: FinancialInfo;
}

export interface PendingToolCall {
  id: string;
  name: string;
  args: any;
}
