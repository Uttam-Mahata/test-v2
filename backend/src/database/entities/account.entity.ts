import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

export const AccountType = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT: 'credit',
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
  })
  type: AccountType;

  @Column({ name: 'account_number', unique: true })
  accountNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  limit: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
