import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '@/users/entities/user.entity';
import { Package } from '@/package/entities/package.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { Appointment } from './entities/appointment.entity';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { SystemConfig } from '@/system-config/entities/system-config.entity';
import { SystemConfigModule } from '@/system-config/system-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User, Package, Workstation, SystemConfig]),
    SystemConfigModule,
    JwtModule.register({
        secret: 'your_jwt_secret', // Usa un secreto seguro en producción
        signOptions: { expiresIn: '1h' },
      }),
],
   controllers: [AppointmentController],
   providers: [AppointmentService],
   exports: [AppointmentService],
})
export class AppointmentModule {}
