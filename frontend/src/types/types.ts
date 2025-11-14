
export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Account {
  id: string;
  userId: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  limit?: number;
  currency: 'USD';
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

export interface Loan {
  id: string;
  userId: string;
  type: 'personal' | 'auto' | 'mortgage';
  principal: number;
  interestRate: number;
  remainingBalance: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
}

export interface FinancialInfo {
  loans?: Loan[];
  creditAccounts?: Account[];
  interestRates?: { [key: string]: string };
}

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