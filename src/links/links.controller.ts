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
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { ApiKeyGuard } from '../auth/api-key.guard';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinksService } from './links.service';

@ApiTags('Links')
@ApiSecurity('x-api-key')
@Controller('links')
@UseGuards(ApiKeyGuard)
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a short URL with optional expiration' })
  @ApiResponse({
    status: 201,
    description: 'Short URL created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid API key.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests.',
  })
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
  @ApiOperation({ summary: 'Get all links for current user' })
  @ApiResponse({
    status: 200,
    description: 'Links retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid API key.',
  })
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
  @ApiOperation({ summary: 'Get link by ID' })
  @ApiResponse({
    status: 200,
    description: 'Link found.',
  })
  @ApiResponse({
    status: 404,
    description: 'Link not found.',
  })
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
@ApiOperation({ summary: 'Update a link' })
@ApiResponse({
  status: 200,
  description: 'Link updated successfully.',
})
@ApiResponse({
  status: 404,
  description: 'Link not found.',
})
@ApiResponse({
  status: 429,
  description: 'Too many requests.',
})
update(
  @Param('id') id: string,
  @Body() body: UpdateLinkDto,
  @Req() req: Request,
) {
  const principalId = req['principal_id'] as string;

  return this.linksService.update(
    +id,
    principalId,
    body,
  );
}
    
  

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a link' })
  @ApiResponse({
    status: 200,
    description: 'Link deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Link not found.',
  })
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
  @Get(':id/stats')
@ApiOperation({ summary: 'Get click analytics and stats for a link' })
@ApiResponse({
  status: 200,
  description: 'Analytics data retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized.',
})
@ApiResponse({
  status: 404,
  description: 'Link not found.',
})
getStats(
  @Param('id') id: string,
  @Req() req: Request,
) {
  const principalId = req['principal_id'] as string;

  return this.linksService.getLinkStats(
    +id,
    principalId,
  );
}
}