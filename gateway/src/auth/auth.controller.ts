import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from './auth.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';
import { ResposeDTO } from '@/base/dto/base.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }
}
