import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();
const configService = new ConfigService();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_DATABASE_NAME'),
  entities: ['src/**/*.entity.{ts,js}'],
  migrations: ['./migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
  synchronize: true,
  logging: false,
});
