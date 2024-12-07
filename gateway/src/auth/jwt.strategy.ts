import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '@/users/users.service';
import { UserDto } from '@/users/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_jwt_secret', // Use a secure secret in production
    });
  }

  //   async validate(payload: any) {
  //     console.log('payload desde el validate', payload);
  //     const userDto = new UserDto();
  //     userDto.id = payload.id;
  //     return this.usersService.getBy(payload);
  //   }
}
