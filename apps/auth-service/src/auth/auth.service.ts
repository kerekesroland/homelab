import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly expiryDays: number;

  constructor(
    private readonly users: UsersService,
    private readonly refreshTokens: RefreshTokensService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.expiryDays = this.config.get<number>('REFRESH_TOKEN_EXPIRY_DAYS') ?? 7;
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.users.findByEmail(dto.email);

    if (!user || !(await compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    const refreshToken = await this.refreshTokens.create(user, this.expiryDays);

    return { accessToken, refreshToken };
  }

  async refresh(
    plain: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const token = await this.refreshTokens.validate(plain);

    const accessToken = this.jwt.sign({
      sub: token.user.id,
      email: token.user.email,
    });

    const refreshToken = await this.refreshTokens.rotate(
      token,
      token.user,
      this.expiryDays,
    );

    return { accessToken, refreshToken };
  }

  async logout(plain: string): Promise<void> {
    await this.refreshTokens.revoke(plain);
  }

  async register(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const hashed = await hash(dto.password, 12);
    const user = await this.users.create(dto.email, hashed);

    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    const refreshToken = await this.refreshTokens.create(user, this.expiryDays);

    return { accessToken, refreshToken };
  }
}
