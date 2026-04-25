import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId = req.user?.sub as string | undefined;
    if (userId) return `user:${userId}`;

    const forwarded = req.headers?.['x-forwarded-for'] as string | string[] | undefined;
    const ip =
      Array.isArray(forwarded)
        ? forwarded[0]
        : typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : (req.ip as string | undefined) ?? 'unknown';

    return `ip:${ip}`;
  }
}
