import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Res,
  GoneException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import type { Request, Response } from 'express';

import { LinksService } from '../links/links.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CacheService } from '../cache/cache.service';

@Controller('r')
export class RedirectController {
constructor(
  private readonly linksService: LinksService,
  private readonly cacheService: CacheService,

  @InjectQueue('click-events')
  private readonly clickQueue: Queue,
) {}

  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {

const link = await this.linksService.findByCode(code);

    // Expiry check
    if (this.linksService.isExpired(link)) {

      await this.cacheService.invalidateRedirectTarget(
        code,
      );

      throw new GoneException(
        'Short link has expired',
      );
    }


    // Password protection check
    if (link.password) {

      throw new ForbiddenException({
        statusCode: 403,
        message: 'This link is password protected.',
        is_protected: true,
      });

    }


    const userAgent =
      req.headers['user-agent'];

    const referrer =
      req.headers['referer'];


    // Cache check
    const cachedUrl =
      await this.cacheService.getRedirectTarget(code);


    if (cachedUrl) {

      await this.clickQueue.add('click-event', {
  linkId: link.id,
  userAgent,
  referrer: referrer as string,
});
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

await this.clickQueue.add('click', {
  linkId: link.id,
  userAgent,
  referrer: referrer as string,
});

    return res.redirect(
      302,
      link.long_url,
    );

  }



  @Post(':code/verify')
  async verifyAndRedirect(
    @Param('code') code: string,
    @Body() dto: VerifyPasswordDto,
  ) {


    
const link =
  await this.linksService.findByCode(code);


    // Check password

    const isValid =
      await this.linksService.verifyPassword(
        code,
        dto.password,
      );



    if (!isValid) {

      throw new UnauthorizedException(
        'Invalid password for this link.',
      );

    }


await this.clickQueue.add('click', {
  linkId: link.id,
});

    return {
      redirect_url: link.long_url,
    };

  }

}