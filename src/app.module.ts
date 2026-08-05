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

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { LinksModule } from './links/links.module';
import { CacheModule } from './cache/cache.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';

import { RedirectController } from './redirect/redirect.controller';

import { LinkEntity } from './links/entities/link.entity';
import { ClickLogEntity } from './links/entities/click-log.entity';
import { WebhookEntity } from './webhooks/entities/webhook.entity';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

import { envValidationSchema } from './config/env.schema';


@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),


    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.APP_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,

        customProps: (req) => ({
          service_name: 'url-shortener',
          request_id:
            req.headers['x-request-id'] || req.id,
        }),
      },
    }),


    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),


    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),

        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),

        database: configService.get<string>('DB_NAME'),

        entities: [
          LinkEntity,
          WebhookEntity,
          ClickLogEntity,
        ],

        migrations: ['dist/migrations/*.js'],
        migrationsRun: true,

        synchronize: false,
      }),
    }),


    LinksModule,
    CacheModule,
    WebhooksModule,
    HealthModule,
    QueueModule,
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

    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');

  }

}