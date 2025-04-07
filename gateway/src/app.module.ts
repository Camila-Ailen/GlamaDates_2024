import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {UsersModule} from './users/users.module';
import {AuthModule} from './auth/auth.module';
import {RolesModule} from './roles/roles.module';
import {DatabaseModule} from './database/database.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CategoryModule } from './category/category.module';
import { ServiceModule } from './service/service.module';
import { PackageModule } from './package/package.module';
import { WorkstationModule } from './workstation/workstation.module';
import { AppointmentModule } from './appointment/appointment.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { DetailsAppointmentModule } from './details-appointment/details-appointment.module';
import { PaymentModule } from './payment/payment.module';
import { MercadopagoModule } from './mercadopago/mercadopago.module';
import { MailerService } from './mailer/mailer.service';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        AuthModule,
        RolesModule,
        DatabaseModule,
        PermissionsModule,
        CategoryModule,
        ServiceModule,
        PackageModule,
        WorkstationModule,
        AppointmentModule,
        SystemConfigModule,
        DetailsAppointmentModule,
        PaymentModule,
        MercadopagoModule,
        AuditoriaModule,
    ],
    providers: [MailerService],
    exports: [MailerService],
})
export class AppModule {
}
