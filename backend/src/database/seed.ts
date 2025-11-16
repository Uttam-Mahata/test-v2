import { dataSourceOptions } from '../config/typeorm.config';
import { DataSource } from 'typeorm';
import { seedDatabase } from './seeds/initial-seed';

async function bootstrap() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    await seedDatabase(dataSource);

    await dataSource.destroy();
    console.log('Data Source has been closed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during Data Source initialization or seeding:', error);
    process.exit(1);
  }
}

bootstrap();
