import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../database/entities/transaction.entity';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private accountsService: AccountsService,
  ) {}

  async create(
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    metadata?: any,
  ): Promise<Transaction> {
    const referenceNumber = this.generateReferenceNumber();

    const transaction = this.transactionsRepository.create({
      accountId,
      type,
      amount,
      description,
      referenceNumber,
      status: TransactionStatus.COMPLETED,
      metadata,
    });

    return await this.transactionsRepository.save(transaction);
  }

  async findAllByAccount(accountId: string, userId: string, limit: number = 50): Promise<Transaction[]> {
    // Verify account ownership
    await this.accountsService.findById(accountId, userId);

    return await this.transactionsRepository.find({
      where: { accountId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findAllByUser(userId: string, limit: number = 50): Promise<Transaction[]> {
    const accounts = await this.accountsService.findAllByUser(userId);
    const accountIds = accounts.map((acc) => acc.id);

    if (accountIds.length === 0) {
      return [];
    }

    return await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.accountId IN (:...accountIds)', { accountIds })
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findById(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Verify ownership
    await this.accountsService.findById(transaction.accountId, userId);

    return transaction;
  }

  private generateReferenceNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `TXN${timestamp}${random}`;
  }
}
