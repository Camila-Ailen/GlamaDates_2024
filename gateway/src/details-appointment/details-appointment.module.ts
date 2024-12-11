import { Module } from '@nestjs/common';
import { DetailsAppointmentService } from './details-appointment.service';
import { DetailsAppointmentController } from './details-appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '@/service/entities/service.entity';
import { Appointment } from '@/appointment/entities/appointment.entity';
import { User } from '@/users/entities/user.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { DetailsAppointment } from './entities/details-appointment.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetailsAppointment, Service]),
    JwtModule.register({
        secret: 'your_jwt_secret', // Usa un secreto seguro en producción
        signOptions: { expiresIn: '1h' },
      }),
],
   controllers: [DetailsAppointmentController],
   providers: [DetailsAppointmentService],
   exports: [DetailsAppointmentService],
})
export class DetailsAppointmentModule {}
