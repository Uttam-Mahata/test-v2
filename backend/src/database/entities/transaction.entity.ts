import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';

export const TransactionType = {
  DEBIT: 'debit',
  CREDIT: 'credit',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REVERSED: 'reversed',
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({
    type: 'varchar',
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ name: 'reference_number', unique: true })
  referenceNumber: string;

  @Column({
    type: 'varchar',
    default: 'completed',
  })
  status: TransactionStatus;

  @Column({ name: 'from_account_id', nullable: true })
  fromAccountId: string;

  @Column({ name: 'to_account_id', nullable: true })
  toAccountId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
