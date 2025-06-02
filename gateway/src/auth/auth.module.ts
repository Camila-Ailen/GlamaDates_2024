import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { UsersModule } from '@/users/users.module';
import { AuthController } from './auth.controller';
import { AuditoriaModule } from '@/auditoria/auditoria.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AuditoriaModule,
    JwtModule.register({
      secret: 'your_jwt_secret', // Use a secure secret in production
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
