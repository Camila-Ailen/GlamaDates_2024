import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { UserDto } from '@/users/dto/user.dto';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new ForbiddenException('Token not provided');
    }

    const decoded = this.jwtService.verify(token);
    console.log('decoded', decoded.id);
    const user: User = await this.usersService.getBy(decoded.id);
    request.user = user;

    const userPermissions = user.role.permissions.map(
      (permission) => permission.permission,
    );

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
    console.log('hasPermission', hasPermission);
    console.log('requiredPermissions', requiredPermissions);
    console.log('userPermissions', userPermissions);
    console.log('user', user);
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
