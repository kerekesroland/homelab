import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';
import { DRIZZLE } from '../db/db.module';
import type { DrizzleDb } from '../db/db.module';
import { refreshTokens, RefreshToken, users, User } from '../db/schema';

@Injectable()
export class RefreshTokensService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  generate(): string {
    return randomBytes(64).toString('hex');
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async create(user: User, expiryDays: number): Promise<string> {
    const plain = this.generate();
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    await this.db
      .insert(refreshTokens)
      .values({ userId: user.id, tokenHash: this.hash(plain), expiresAt });

    return plain;
  }

  async validate(plain: string): Promise<RefreshToken & { user: User }> {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .innerJoin(users, eq(refreshTokens.userId, users.id))
      .where(eq(refreshTokens.tokenHash, this.hash(plain)))
      .limit(1);

    if (!result[0]) throw new UnauthorizedException('Invalid refresh token');

    const { refresh_tokens: token, users: user } = result[0];

    if (token.expiresAt < new Date()) {
      await this.db.delete(refreshTokens).where(eq(refreshTokens.id, token.id));

      throw new UnauthorizedException('Refresh token expired');
    }

    return { ...token, user };
  }

  async rotate(
    old: RefreshToken,
    user: User,
    expiryDays: number,
  ): Promise<string> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.id, old.id));
    return this.create(user, expiryDays);
  }

  async revoke(plain: string): Promise<void> {
    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, this.hash(plain)));
  }
}
