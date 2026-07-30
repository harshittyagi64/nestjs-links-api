import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
} from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { LinksModule } from './links/links.module';
import { CacheModule } from './cache/cache.module';
import { RedirectController } from './redirect/redirect.controller';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { WebhooksModule } from './webhooks/webhooks.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
  ThrottlerModule.forRoot([
    {
      ttl: 60000,
      limit: 10,
    },
  ]),
  LinksModule,
  CacheModule,
  WebhooksModule,
],
  controllers: [
    AppController,
    RedirectController,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}