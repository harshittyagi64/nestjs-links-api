import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  NotFoundException,
  GoneException,
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

    // 1. Check cache first
      @Get(':code')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async redirect(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // 1. Fetch link first
    const link = this.linksService.findByCode(code);

    // 2. Check expiration
    if (this.linksService.isExpired(link)) {
      await this.cacheService.invalidateRedirectTarget(code);
      throw new GoneException('Short link has expired');
    }

    // 3. Check Redis cache
    const cachedUrl = await this.cacheService.getRedirectTarget(code);

    if (cachedUrl) {
      this.linksService
        .recordClick(code, {
          userAgent: req.headers['user-agent'],
          ip:
            (req.headers['x-forwarded-for'] as string) ||
            req.ip ||
            req.socket.remoteAddress,
        })
        .catch(() => {});

      return res.redirect(302, cachedUrl);
    }

    // 4. Cache miss
    await this.cacheService.setRedirectTarget(
      code,
      link.long_url,
      3600,
    );

    // 5. Analytics
    this.linksService
      .recordClick(code, {
        userAgent: req.headers['user-agent'],
        ip:
          (req.headers['x-forwarded-for'] as string) ||
          req.ip ||
          req.socket.remoteAddress,
      })
      .catch(() => {});

    return res.redirect(302, link.long_url);
  }

} 
