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
  Res,
  NotFoundException,
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
import { CreateBulkLinksDto } from './dto/create-bulk-links.dto';
import { QueryLinksDto } from './dto/query-links.dto';
import type { Response } from 'express';
import { QueryQrDto } from './dto/query-qr.dto';
import { LinksService } from './links.service';

@ApiTags('Links')
@ApiSecurity('x-api-key')
@Controller('links')
@UseGuards(ApiKeyGuard)
export class LinksController {
  @Get(':id/qr')
@ApiOperation({ summary: 'Generate QR code for short link' })
@ApiResponse({ status: 200, description: 'QR generated successfully' })
async generateQrCode(
  @Req() req: Request,
  @Param('id') id: string,
  @Query() queryDto: QueryQrDto,
  @Res() res: Response,
) {

  const principalId = req['principal_id'];

  const link = await this.linksService.findOne(
    +id,
    principalId,
  );

  const protocol = req['protocol'] || 'http';
  const host = req.headers['host'] || 'localhost:3000';

  const result =
    await this.linksService.generateQrCode(
      link.code,
      `${protocol}://${host}`,
      queryDto.format,
      queryDto.width,
      queryDto.margin,
    );


  res.setHeader(
    'Content-Type',
    result.contentType,
  );

  return res.send(result.data);
}
  constructor(private readonly linksService: LinksService) {}

// ---------------- BULK CREATE ----------------

@Post('bulk')
@ApiOperation({ summary: 'Create multiple short links in a single batch request' })
@ApiResponse({
  status: 201,
  description: 'Bulk short links created successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid payload or batch limit exceeded.',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized.',
})
@ApiResponse({
  status: 409,
  description: 'Custom short code conflict.',
})
createBulk(
  @Body() dto: CreateBulkLinksDto,
  @Req() req: Request,
) {
  const principalId = req['principal_id'] as string;

  return this.linksService.createBulk(
    principalId,
    dto.links,
  );
}

// ---------------- SINGLE CREATE ----------------

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
@ApiOperation({ summary: 'Get paginated list of links with search filtering' })
@ApiResponse({
  status: 200,
  description: 'Paginated links retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized.',
})
findAll(
  @Req() req: Request,
  @Query() queryDto: QueryLinksDto,
) {
  const principalId = req['principal_id'] as string;
return this.linksService.findPaginated(
  principalId,
  queryDto.page,
  queryDto.limit,
  queryDto.search,
  queryDto.tag,
  queryDto.sort,
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
    @Get(':id/analytics')
  @ApiOperation({
    summary: 'Get detailed click metrics and device/referrer analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Link not found.',
  })
  async getAnalytics(
    @Req() req: Request,
    @Param('id') id: string,
  ) {

    const principalId =
      req['principal_id'] as string;


    const link =
  await this.linksService.findOne(
    +id,
    principalId,
  );


    if (!link) {
      throw new NotFoundException(
        'Link not found',
      );
    }


    return this.linksService.getAnalytics(
      +id,
    );
  }
}
