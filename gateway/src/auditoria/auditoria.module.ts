import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auditoria])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
})
export class AuditoriaModule {}
