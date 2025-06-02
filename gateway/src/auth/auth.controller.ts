import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuditoriaService } from '@/auditoria/auditoria.service';
import { SkipAudit } from '@/auditoria/skip_audit.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditoriaService: AuditoriaService,
  ) {}

  @Post('login')
  @SkipAudit() // Skip audit for login endpoint
  async login(@Body() loginDto: { email: string; password: string }) {
    console.log('loginDto: ', loginDto);
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    // Auditar login aquí
    await this.auditoriaService.create({
      userId: user.id,
      entity: 'Auth',
      accion: 'LOGIN',
      description: `Inicio de sesión para ${user.email}`,
      oldData: null,
      newData: null,
    });

    return this.authService.login(user);
  }
}
