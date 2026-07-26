import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinksService } from './links.service';

@Controller('links')
@UseGuards(ApiKeyGuard)
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  create(
    @Body() createLinkDto: CreateLinkDto,
    @Req() req: Request,
  ) {
    const principalId = req['principal_id'] as string;

    return this.linksService.create(
      createLinkDto,
      principalId,
    );
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const principalId = req['principal_id'] as string;

    return this.linksService.findAll(
      principalId,
      +page,
      +limit,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const principalId = req['principal_id'] as string;

    return this.linksService.findOne(
      +id,
      principalId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { long_url: string },
    @Req() req: Request,
  ) {
    const principalId = req['principal_id'] as string;

    return this.linksService.update(
      +id,
      principalId,
      body.long_url,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const principalId = req['principal_id'] as string;

    return this.linksService.remove(
      +id,
      principalId,
    );
  }
}