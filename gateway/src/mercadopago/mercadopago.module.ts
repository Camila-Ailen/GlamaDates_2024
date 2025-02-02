import { forwardRef, Module } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { MercadopagoController } from './mercadopago.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mercadopago } from './entities/mercadopago.entity';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from '@/users/users.module';
import { AppointmentModule } from '@/appointment/appointment.module';

@Module({
  imports: [
    UsersModule,
        forwardRef(() => AppointmentModule),

      TypeOrmModule.forFeature([Mercadopago, User]),
      JwtModule.register({
          secret: 'your_jwt_secret', // Usa un secreto seguro en producción
          signOptions: { expiresIn: '1h' },
        }),
  ],
  controllers: [MercadopagoController],
  providers: [MercadopagoService],
  exports: [MercadopagoService],
})
export class MercadopagoModule {}
