import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { CacheModule } from '../cache/cache.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { LinkEntity } from './entities/link.entity';
import { ClickLogEntity } from './entities/click-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkEntity, ClickLogEntity]),
    CacheModule,
    WebhooksModule,
  ],
  controllers: [LinksController],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}