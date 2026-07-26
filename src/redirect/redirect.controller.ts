import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { LinksService } from '../links/links.service';
import { CacheService } from '../cache/cache.service';

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

    // 4. Redirect
    return res.redirect(302, link.long_url);
  }
}