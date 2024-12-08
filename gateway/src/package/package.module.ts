import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { Service } from '@/service/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Package, Service])],
  controllers: [PackageController],
  providers: [PackageService],
})
export class PackageModule {}
