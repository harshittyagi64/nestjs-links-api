import {
  Controller,
  Get,
  Param,
  Res,
  Req,
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


  @Get(':code')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async redirect(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {

    const link =
      this.linksService.findByCode(code);


    // Expiry check
    if (this.linksService.isExpired(link)) {

      await this.cacheService.invalidateRedirectTarget(
        code,
      );

      throw new GoneException(
        'Short link has expired',
      );
    }


    const userAgent =
      req.headers['user-agent'];


    const referrer =
      req.headers['referer'];


    // Cache check
    const cachedUrl =
      await this.cacheService.getRedirectTarget(code);


    if (cachedUrl) {

      await this.linksService.recordClick(
        link.id,
        userAgent,
        referrer as string,
      );


      return res.redirect(
        302,
        cachedUrl,
      );
    }


    // Cache miss
    await this.cacheService.setRedirectTarget(
      code,
      link.long_url,
      3600,
    );


    await this.linksService.recordClick(
      link.id,
      userAgent,
      referrer as string,
    );


    return res.redirect(
      302,
      link.long_url,
    );
  }
}