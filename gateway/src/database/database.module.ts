import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('DATABASE_HOST');
        const port = configService.get('DATABASE_PORT');
        const username = configService.get('DATABASE_USERNAME');
        const password = configService.get('DATABASE_PASSWORD');
        const database = configService.get('DATABASE_NAME');
        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: ['src/**/*.entity.{ts,js}'],
          migrations: ['./migrations/*.{ts,js}'],
          migrationsTableName: 'migrations',
          // autoLoadEntities: true,
          synchronize: true,
          logging: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
