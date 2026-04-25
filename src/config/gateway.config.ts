import { registerAs } from '@nestjs/config';

export interface RouteConfig {
  prefix: string;
  target: string;
  public?: boolean;
}

const DEFAULT_ROUTES: RouteConfig[] = [
  { prefix: '/users', target: 'http://user-service:3001' },
  { prefix: '/orders', target: 'http://order-service:3002' },
];

export default registerAs('gatewayRoutes', (): RouteConfig[] => {
  const raw = process.env.GATEWAY_ROUTES;
  if (!raw) return DEFAULT_ROUTES;
  try {
    return JSON.parse(raw) as RouteConfig[];
  } catch {
    return DEFAULT_ROUTES;
  }
});
