import {
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new event webhook',
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook registered successfully.',
  })
  async create(
    @Req() req: any,
    @Body() dto: CreateWebhookDto,
  ) {
    const principalId = req.principal_id;

    return this.webhooksService.register(
      principalId,
      dto.url,
      dto.events,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all registered webhooks',
  })
  async findAll(
    @Req() req: any,
  ) {
    const principalId = req.principal_id;

    return this.webhooksService.findByPrincipal(
      principalId,
    );
  }
}