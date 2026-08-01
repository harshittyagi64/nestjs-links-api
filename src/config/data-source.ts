import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { LinkEntity } from '../links/entities/link.entity';
import { ClickLogEntity } from '../links/entities/click-log.entity';
import { WebhookEntity } from '../webhooks/entities/webhook.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgrespassword',
  database: process.env.DB_NAME || 'links_db',

  entities: [LinkEntity, ClickLogEntity, WebhookEntity],

  migrations: ['src/migrations/*.ts'],

  synchronize: false,
});