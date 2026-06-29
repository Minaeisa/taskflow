import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.usersService.create(dto);
    const tokens = await this.generateTokens(user._id.toString(), user.email);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true) as any;
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user._id.toString(), user.email);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(user: any) {
    const tokens = await this.generateTokens(user._id.toString(), user.email);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'access-secret',
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.refreshToken;
    return obj;
  }
}
