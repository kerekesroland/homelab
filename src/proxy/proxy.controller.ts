import { All, Controller, Next, Req, Res } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ProxyService } from './proxy.service';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxy(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    const user = (req as Request & { user?: JwtPayload }).user;
    if (user?.sub) req.headers['x-user-id'] = user.sub;
    if (user?.roles?.length) req.headers['x-user-roles'] = user.roles.join(',');

    const middleware = this.proxyService.getMiddleware(req.path);
    await middleware(req, res, next);
  }
}
