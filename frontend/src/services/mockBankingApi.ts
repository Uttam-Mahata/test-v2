
import { User, Account, Transaction, Loan } from '../types';

// FIX: Explicitly type MOCK_DATA to ensure properties match their respective interfaces.
const MOCK_DATA: {
  users: User[];
  accounts: Account[];
  transactions: Transaction[];
  loans: Loan[];
  interestRates: { [key: string]: string };
} = {
  users: [
    { id: 'user123', name: 'Alex Johnson', pin: '1234' },
  ],
  accounts: [
    { id: 'acc_chk_001', userId: 'user123', type: 'checking', balance: 5210.55, currency: 'USD' },
    { id: 'acc_sav_001', userId: 'user123', type: 'savings', balance: 15832.10, currency: 'USD' },
    { id: 'acc_crd_001', userId: 'user123', type: 'credit', balance: -750.25, limit: 10000, currency: 'USD' },
  ],
  transactions: [
    { id: 'txn_001', accountId: 'acc_chk_001', date: '2024-07-20', description: 'Grocery Store', amount: 85.60, type: 'debit' },
    { id: 'txn_002', accountId: 'acc_chk_001', date: '2024-07-19', description: 'Paycheck Deposit', amount: 2200.00, type: 'credit' },
    { id: 'txn_003', accountId: 'acc_chk_001', date: '2024-07-18', description: 'Gas Station', amount: 45.00, type: 'debit' },
    { id: 'txn_004', accountId: 'acc_sav_001', date: '2024-07-15', description: 'Interest Payment', amount: 25.12, type: 'credit' },
    { id: 'txn_005', accountId: 'acc_crd_001', date: '2024-07-17', description: 'Online Shopping', amount: 129.99, type: 'debit' },
  ],
  loans: [
    { id: 'loan_001', userId: 'user123', type: 'auto', principal: 25000, interestRate: 4.5, remainingBalance: 12543.89, nextPaymentDate: '2024-08-01', nextPaymentAmount: 450.00 },
    { id: 'loan_002', userId: 'user123', type: 'personal', principal: 5000, interestRate: 8.2, remainingBalance: 1200.50, nextPaymentDate: '2024-08-15', nextPaymentAmount: 200.00 }
  ],
  interestRates: {
      savings: '0.5% APY',
      'auto-loan': 'Starting at 4.2% APR',
      'personal-loan': 'Starting at 7.9% APR',
      mortgage: 'Contact us for current rates',
  }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const bankingApi = {
  authenticate: async (userId: string): Promise<User | null> => {
    await delay(500);
    const user = MOCK_DATA.users.find(u => u.id === userId);
    return user || null;
  },
  
  getAccounts: async (userId: string): Promise<Account[]> => {
    await delay(500);
    return MOCK_DATA.accounts.filter(acc => acc.userId === userId);
  },

  getTransactions: async (userId: string, accountType: string): Promise<Transaction[] | { error: string }> => {
    await delay(700);
    const account = MOCK_DATA.accounts.find(acc => acc.userId === userId && acc.type === accountType);
    if (!account) {
      return { error: `Account type '${accountType}' not found.` };
    }
    return MOCK_DATA.transactions.filter(txn => txn.accountId === account.id);
  },

  getFinancialProductsInfo: async (userId: string, productType: 'loans' | 'credit_limit' | 'interest_rates'): Promise<any> => {
    await delay(600);
    switch (productType) {
        case 'loans':
            return MOCK_DATA.loans.filter(l => l.userId === userId);
        case 'credit_limit':
            return MOCK_DATA.accounts.filter(a => a.userId === userId && a.type === 'credit');
        case 'interest_rates':
            return MOCK_DATA.interestRates;
        default:
            return { error: 'Unknown product type' };
    }
  },

  transferFunds: async (
    userId: string, 
    fromAccountType: string, 
    toAccountType: string, 
    amount: number, 
    pin: string
  ): Promise<{ success: boolean; message: string; confirmationNumber?: string }> => {
    await delay(1500);
    const user = MOCK_DATA.users.find(u => u.id === userId);
    if (!user || user.pin !== pin) {
      return { success: false, message: 'Invalid PIN.' };
    }

    const fromAccount = MOCK_DATA.accounts.find(acc => acc.userId === userId && acc.type === fromAccountType);
    const toAccount = MOCK_DATA.accounts.find(acc => acc.userId === userId && acc.type === toAccountType);

    if (!fromAccount || !toAccount) {
      return { success: false, message: 'One or both accounts not found.' };
    }
    if (fromAccount.balance < amount) {
      return { success: false, message: 'Insufficient funds.' };
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;
    
    const confirmationNumber = `TXN${Date.now()}`;
    return { success: true, message: 'Transfer successful.', confirmationNumber };
  }
};