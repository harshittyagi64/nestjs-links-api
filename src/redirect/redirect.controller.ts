import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  NotFoundException,
} from '@nestjs/common';

import type { Request, Response } from 'express';
import { LinksService } from '../links/links.service';
import { CacheService } from '../cache/cache.service';
import { Throttle } from '@nestjs/throttler';

@Controller('r')
export class RedirectController {
  constructor(
    private readonly linksService: LinksService,
    private readonly cacheService: CacheService,
  ) {}

  @Get(':code')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async redirect(
  @Param('code') code: string,
  @Req() req: Request,
  @Res() res: Response,

  ) {
    // 1. Check cache first
    const cachedUrl = await this.cacheService.getRedirectTarget(code);

    if (cachedUrl) {
      return res.redirect(302, cachedUrl);
    }

    // 2. Cache miss -> fetch from LinksService
    const link = this.linksService.findByCode(code);

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    // 3. Save in cache for 1 hour
    await this.cacheService.setRedirectTarget(
  code,
  link.long_url,
  3600,
);

const userAgent = req.headers['user-agent'];
const ip =
  (req.headers['x-forwarded-for'] as string) ||
  req.ip ||
  req.socket.remoteAddress;

this.linksService
  .recordClick(code, { userAgent, ip })
  .catch(() => {});

return res.redirect(302, link.long_url);
  }

} 