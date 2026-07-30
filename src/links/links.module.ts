import { Module } from '@nestjs/common';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { CacheModule } from '../cache/cache.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    CacheModule,
    WebhooksModule,
  ],
  controllers: [LinksController],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}