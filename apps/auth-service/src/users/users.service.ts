import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DrizzleDb } from '../db/db.module';
import { users, User } from '../db/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async create(email: string, hashedPassword: string): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({ email, password: hashedPassword })
      .returning();

    return result[0];
  }
}
