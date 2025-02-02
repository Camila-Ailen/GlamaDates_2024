import { forwardRef, Module } from '@nestjs/common';
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
import { SystemConfigService } from '@/system-config/system-config.service';
import { DetailsAppointment } from '@/details-appointment/entities/details-appointment.entity';
import { Service } from '@/service/entities/service.entity';
import { UsersModule } from '@/users/users.module';
import { MercadopagoModule } from '@/mercadopago/mercadopago.module';
import { MercadopagoService } from '@/mercadopago/mercadopago.service';
import { PaymentModule } from '@/payment/payment.module';
import { Payment } from '@/payment/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User, Package, Workstation, SystemConfig, DetailsAppointment, Service, Payment]),
    SystemConfigModule,
    UsersModule,
    PaymentModule,
    forwardRef(() => MercadopagoModule),
    JwtModule.register({
        secret: 'your_jwt_secret', // Usa un secreto seguro en producción
        signOptions: { expiresIn: '1h' },
      }),
],
   controllers: [AppointmentController],
   providers: [AppointmentService, AppointmentController, Service, MercadopagoService],
   exports: [AppointmentService],
})
export class AppointmentModule {}
