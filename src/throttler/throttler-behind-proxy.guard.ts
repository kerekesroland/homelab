import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

interface AuthedRequest extends Request {
  user?: { sub: string };
}

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const typed = req as unknown as AuthedRequest;
    const userId = typed.user?.sub;
    if (userId) return Promise.resolve(`user:${userId}`);

    const forwarded = typed.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : (typed.ip ?? 'unknown');

    return Promise.resolve(`ip:${ip}`);
  }
}
