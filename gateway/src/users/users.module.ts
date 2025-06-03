import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@/roles/entities/role.entity';
import { Category } from '@/category/entities/category.entity';
import { AuditoriaModule } from '@/auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Category]),
    AuditoriaModule,
    JwtModule.register({
        secret: 'your_jwt_secret', // Usa un secreto seguro en producción
        signOptions: { expiresIn: '1h' },
      }),
],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
