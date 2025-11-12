import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { User } from '../entities/user.entity';
import { Account, AccountType } from '../entities/account.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { Loan, LoanType } from '../entities/loan.entity';

export async function seedDatabase(dataSource: DataSource) {
  console.log('Seeding database...');

  const userRepository = dataSource.getRepository(User);
  const accountRepository = dataSource.getRepository(Account);
  const transactionRepository = dataSource.getRepository(Transaction);
  const loanRepository = dataSource.getRepository(Loan);

  // Create test user
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const hashedPin = await bcrypt.hash('1234', 10);
  const otpSecret = speakeasy.generateSecret({
    name: 'AI Financial Assistant (demo@example.com)',
  }).base32;

  const user = userRepository.create({
    email: 'demo@example.com',
    name: 'Demo User',
    password: hashedPassword,
    pin: hashedPin,
    phoneNumber: '+1234567890',
    otpSecret,
    isActive: true,
    isVerified: true,
  });

  await userRepository.save(user);
  console.log('✓ Created test user (demo@example.com / Password123!)');

  // Create accounts
  const checkingAccount = accountRepository.create({
    userId: user.id,
    type: AccountType.CHECKING,
    accountNumber: '1001234567',
    balance: 5210.55,
    currency: 'USD',
    isActive: true,
  });

  const savingsAccount = accountRepository.create({
    userId: user.id,
    type: AccountType.SAVINGS,
    accountNumber: '2001234567',
    balance: 15832.10,
    currency: 'USD',
    isActive: true,
  });

  const creditAccount = accountRepository.create({
    userId: user.id,
    type: AccountType.CREDIT,
    accountNumber: '3001234567',
    balance: -750.25,
    limit: 10000,
    currency: 'USD',
    isActive: true,
  });

  await accountRepository.save([checkingAccount, savingsAccount, creditAccount]);
  console.log('✓ Created accounts (checking, savings, credit)');

  // Create transactions
  const transactions = [
    {
      accountId: checkingAccount.id,
      type: TransactionType.DEBIT,
      amount: 85.60,
      description: 'Grocery Store',
      referenceNumber: `TXN${Date.now()}001`,
    },
    {
      accountId: checkingAccount.id,
      type: TransactionType.CREDIT,
      amount: 2200.00,
      description: 'Paycheck Deposit',
      referenceNumber: `TXN${Date.now()}002`,
    },
    {
      accountId: checkingAccount.id,
      type: TransactionType.DEBIT,
      amount: 45.00,
      description: 'Gas Station',
      referenceNumber: `TXN${Date.now()}003`,
    },
    {
      accountId: savingsAccount.id,
      type: TransactionType.CREDIT,
      amount: 25.12,
      description: 'Interest Payment',
      referenceNumber: `TXN${Date.now()}004`,
    },
    {
      accountId: creditAccount.id,
      type: TransactionType.DEBIT,
      amount: 129.99,
      description: 'Online Shopping',
      referenceNumber: `TXN${Date.now()}005`,
    },
  ];

  for (const txnData of transactions) {
    const transaction = transactionRepository.create(txnData);
    await transactionRepository.save(transaction);
  }

  console.log('✓ Created sample transactions');

  // Create loans
  const autoLoan = loanRepository.create({
    userId: user.id,
    type: LoanType.AUTO,
    loanNumber: 'LOAN1001234567',
    principal: 25000,
    interestRate: 4.5,
    remainingBalance: 12543.89,
    nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    nextPaymentAmount: 450.00,
    termMonths: 60,
  });

  const personalLoan = loanRepository.create({
    userId: user.id,
    type: LoanType.PERSONAL,
    loanNumber: 'LOAN2001234567',
    principal: 5000,
    interestRate: 8.2,
    remainingBalance: 1200.50,
    nextPaymentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    nextPaymentAmount: 200.00,
    termMonths: 36,
  });

  await loanRepository.save([autoLoan, personalLoan]);
  console.log('✓ Created loans');

  console.log('Database seeding completed successfully!');
  console.log('\nTest credentials:');
  console.log('Email: demo@example.com');
  console.log('Password: Password123!');
  console.log('PIN: 1234');
}
