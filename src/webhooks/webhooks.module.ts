import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEntity } from './entities/webhook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEntity])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}