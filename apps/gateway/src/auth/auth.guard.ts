import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';

interface RouteConfig {
  prefix: string;
  public?: boolean;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly publicPrefixes: string[];

  constructor(
    private readonly reflector: Reflector,
    config: ConfigService,
  ) {
    super();
    const raw = config.get<string>('GATEWAY_ROUTES') ?? '[]';
    const routes = JSON.parse(raw) as RouteConfig[];
    this.publicPrefixes = routes.filter((r) => r.public).map((r) => r.prefix);
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    if (this.publicPrefixes.some((prefix) => req.path.startsWith(prefix)))
      return true;

    return super.canActivate(context);
  }

  handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) throw err ?? new UnauthorizedException();
    return user;
  }
}
