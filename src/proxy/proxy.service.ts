import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { RequestHandler } from 'http-proxy-middleware';
import type { IncomingMessage, ServerResponse } from 'http';
import { RouteConfig } from '../config/gateway.config';

@Injectable()
export class ProxyService {
  private readonly routes: RouteConfig[];
  private readonly cache = new Map<string, RequestHandler<IncomingMessage, ServerResponse>>();

  constructor(private readonly config: ConfigService) {
    this.routes = this.config.get<RouteConfig[]>('gatewayRoutes') ?? [];
  }

  getMiddleware(path: string): RequestHandler<IncomingMessage, ServerResponse> {
    const route = this.routes.find((r) => path.startsWith(r.prefix));
    if (!route) throw new NotFoundException(`No upstream configured for: ${path}`);

    if (!this.cache.has(route.prefix)) {
      const middleware = createProxyMiddleware<IncomingMessage, ServerResponse>({
        target: route.target,
        changeOrigin: true,
        pathRewrite: { [`^${route.prefix}`]: '' },
        on: {
          error: (_err, _req, res) => {
            const serverRes = res as ServerResponse;
            if (!serverRes.headersSent) {
              serverRes.writeHead(502, { 'Content-Type': 'application/json' });
              serverRes.end(JSON.stringify({ statusCode: 502, error: 'Bad Gateway' }));
            }
          },
        },
      });
      this.cache.set(route.prefix, middleware);
    }

    return this.cache.get(route.prefix)!;
  }
}
