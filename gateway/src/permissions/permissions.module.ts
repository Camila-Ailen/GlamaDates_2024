import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from './entities/permission.entity';
import { Role } from '@/roles/entities/role.entity';
import { User } from '@/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  providers: [PermissionsService],
})
export class PermissionsModule {}
