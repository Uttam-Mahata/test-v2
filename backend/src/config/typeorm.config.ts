import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { User } from '../database/entities/user.entity';
import { Account } from '../database/entities/account.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { Loan } from '../database/entities/loan.entity';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const sslEnabled = configService.get('DB_SSL') === 'true';

  let sslConfig: any = false;

  // Add SSL configuration if enabled
  if (sslEnabled) {
    try {
      const ca = readFileSync(join(__dirname, '../../ca-certificate.crt'), 'utf8');
      sslConfig = {
        rejectUnauthorized: true,
        ca: ca,
      };
    } catch (error) {
      console.warn('SSL certificate file not found, using basic SSL');
      sslConfig = {
        rejectUnauthorized: false,
      };
    }
  }

  return {
    type: 'postgres',
    host: configService.get('database.host'),
    port: configService.get('database.port'),
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.database'),
    entities: [User, Account, Transaction, Loan],
    migrations: [],
    synchronize: configService.get('nodeEnv') === 'development',
    logging: configService.get('nodeEnv') === 'development',
    ssl: sslConfig,
  };
};

// For TypeORM CLI and seeding
const sslEnabled = process.env.DB_SSL === 'true';

let sslConfig: any = false;
if (sslEnabled) {
  try {
    const ca = readFileSync(join(__dirname, '../../ca-certificate.crt'), 'utf8');
    sslConfig = {
      rejectUnauthorized: true,
      ca: ca,
    };
  } catch (error) {
    console.warn('SSL certificate file not found, using basic SSL');
    sslConfig = {
      rejectUnauthorized: false,
    };
  }
}

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ai_financial_assistant',
  entities: [User, Account, Transaction, Loan],
  migrations: [],
  ssl: sslConfig,
};

export { dataSourceOptions };
export default new DataSource(dataSourceOptions);
