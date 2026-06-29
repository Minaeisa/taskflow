import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string }) {
    const { refreshToken } = req.body;
    const user = await this.usersService.findByEmail(
      payload['email'],
      true,
    ) as any;

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const match = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!match) throw new UnauthorizedException('Invalid refresh token');

    return user;
  }
}
