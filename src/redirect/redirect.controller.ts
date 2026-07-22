import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LinksService } from '../links/links.service';

@Controller('r')
export class RedirectController {

  constructor(
    private readonly linksService: LinksService,
  ) {}

  @Get(':code')
  redirect(
    @Param('code') code: string,
    @Res() res: Response,
  ) {
    const link = this.linksService.findByCode(code);

    return res.redirect(302, link.long_url);
  }
}