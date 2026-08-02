import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClickProcessor } from './click.processor';
import { LinksModule } from '../links/links.module';

@Module({
  imports: [
    ConfigModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL'),
        },
      }),
    }),

    BullModule.registerQueue({
  name: 'click-events',
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: false,
  },
}),

    LinksModule,
  ],

  providers: [
    ClickProcessor,
  ],

  exports: [
    BullModule,
  ],
})
export class QueueModule {}
