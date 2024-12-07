import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '@/users/entities/user.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Category]),
    JwtModule.register({
        secret: 'your_jwt_secret', // Usa un secreto seguro en producción
        signOptions: { expiresIn: '1h' },
      }),
],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
