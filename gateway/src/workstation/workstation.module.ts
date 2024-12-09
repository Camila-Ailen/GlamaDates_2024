import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { WorkstationController } from './workstation.controller';
import { WorkstationService } from './workstation.service';
import { Category } from '@/category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Workstation]),
    JwtModule.register({
        secret: 'your_jwt_secret', // Usa un secreto seguro en producción
        signOptions: { expiresIn: '1h' },
      }),
],
  controllers: [WorkstationController],
  providers: [WorkstationService],
})
export class WorkstationModule {}
