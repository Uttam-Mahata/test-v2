import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan, LoanType, LoanStatus } from '../database/entities/loan.entity';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private loansRepository: Repository<Loan>,
  ) {}

  async findAllByUser(userId: string): Promise<Loan[]> {
    return await this.loansRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Loan> {
    const loan = await this.loansRepository.findOne({
      where: { id, userId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async findActiveLoans(userId: string): Promise<Loan[]> {
    return await this.loansRepository.find({
      where: { userId, status: LoanStatus.ACTIVE },
      order: { nextPaymentDate: 'ASC' },
    });
  }

  async getInterestRates(): Promise<any> {
    return {
      savings: '0.5% APY',
      'auto-loan': 'Starting at 4.2% APR',
      'personal-loan': 'Starting at 7.9% APR',
      mortgage: 'Starting at 6.5% APR',
      'business-loan': 'Starting at 5.5% APR',
    };
  }
}
