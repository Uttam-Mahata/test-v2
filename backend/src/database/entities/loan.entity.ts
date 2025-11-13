import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export const LoanType = {
  PERSONAL: 'personal',
  AUTO: 'auto',
  MORTGAGE: 'mortgage',
  BUSINESS: 'business',
} as const;

export type LoanType = typeof LoanType[keyof typeof LoanType];

export const LoanStatus = {
  ACTIVE: 'active',
  PAID_OFF: 'paid_off',
  DEFAULTED: 'defaulted',
  PENDING: 'pending',
} as const;

export type LoanStatus = typeof LoanStatus[keyof typeof LoanStatus];

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.loans)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
  })
  type: LoanType;

  @Column({ name: 'loan_number', unique: true })
  loanNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  principal: number;

  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @Column({ name: 'remaining_balance', type: 'decimal', precision: 15, scale: 2 })
  remainingBalance: number;

  @Column({ name: 'next_payment_date', type: 'date' })
  nextPaymentDate: Date;

  @Column({ name: 'next_payment_amount', type: 'decimal', precision: 15, scale: 2 })
  nextPaymentAmount: number;

  @Column({ name: 'term_months', type: 'int' })
  termMonths: number;

  @Column({
    type: 'varchar',
    default: 'active',
  })
  status: LoanStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
