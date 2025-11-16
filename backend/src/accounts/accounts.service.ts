import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType } from '../database/entities/account.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(userId: string, type: AccountType, initialBalance: number = 0): Promise<Account> {
    const accountNumber = this.generateAccountNumber();

    const account = this.accountsRepository.create({
      userId,
      type,
      accountNumber,
      balance: initialBalance,
      currency: 'USD',
      isActive: true,
    });

    if (type === AccountType.CREDIT) {
      account.limit = 10000;
      account.balance = 0;
    }

    return await this.accountsRepository.save(account);
  }

  async findAllByUser(userId: string): Promise<Account[]> {
    return await this.accountsRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async findByType(userId: string, type: AccountType): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { userId, type, isActive: true },
    });

    if (!account) {
      throw new NotFoundException(`${type} account not found`);
    }

    return account;
  }

  async getBalance(id: string, userId: string): Promise<number> {
    const account = await this.findById(id, userId);
    return account.balance;
  }

  async updateBalance(id: string, amount: number): Promise<Account> {
    const account = await this.accountsRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    account.balance = Number(account.balance) + amount;

    // Check credit limit
    if (account.type === AccountType.CREDIT && account.limit) {
      const creditUsed = Math.abs(Number(account.balance));
      if (creditUsed > Number(account.limit)) {
        throw new BadRequestException('Credit limit exceeded');
      }
    }

    // Check sufficient funds for debit accounts
    if (account.type !== AccountType.CREDIT && account.balance < 0) {
      throw new BadRequestException('Insufficient funds');
    }

    return await this.accountsRepository.save(account);
  }

  async deactivate(id: string, userId: string): Promise<void> {
    const account = await this.findById(id, userId);
    account.isActive = false;
    await this.accountsRepository.save(account);
  }

  private generateAccountNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp.slice(-6)}${random}`;
  }
}
