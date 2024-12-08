import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {UsersModule} from './users/users.module';
import {AuthModule} from './auth/auth.module';
import {RolesModule} from './roles/roles.module';
import {DatabaseModule} from './database/database.module';
import {ClientsModule} from './clients/clients.module';
import {CitiesModule} from './cities/cities.module';
import {CountriesModule} from './countries/countries.module';
import {StatesModule} from './states/states.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CategoryModule } from './category/category.module';
import { ServiceModule } from './service/service.module';
import { PackageModule } from './package/package.module';
import { WorkstationModule } from './workstation/workstation.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        AuthModule,
        RolesModule,
        DatabaseModule,
        ClientsModule,
        CitiesModule,
        StatesModule,
        CountriesModule,
        PermissionsModule,
        CategoryModule,
        ServiceModule,
        PackageModule,
        WorkstationModule,
    ]
})
export class AppModule {
}
