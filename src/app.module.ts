import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinksController } from './links/links.controller';
import { LinksService } from './links/links.service';
import { RedirectController } from './redirect/redirect.controller';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
  controllers: [AppController, LinksController, RedirectController],
  providers: [AppService, LinksService],
})
export class AppModule {}
