import { Appointment } from "@/appointment/entities/appointment.entity";
import { DetailsAppointment } from "@/details-appointment/entities/details-appointment.entity";
import { Package } from "@/package/entities/package.entity";
import { Service } from "@/service/entities/service.entity";
import { SystemConfig } from "@/system-config/entities/system-config.entity";
import { User } from "@/users/entities/user.entity";
import { Workstation } from "@/workstation/entities/workstation.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { SystemConfigModule } from "@/system-config/system-config.module";
import { UsersModule } from "@/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([Payment, Appointment, User, Package, Workstation, SystemConfig, DetailsAppointment, Service]),
        SystemConfigModule,
        UsersModule,
        JwtModule.register({
                secret: 'your_jwt_secret', // Usa un secreto seguro en producción
                signOptions: { expiresIn: '1h' },
              }),
    ],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentController, Service],
    exports: [PaymentService],
})

export class PaymentModule {}