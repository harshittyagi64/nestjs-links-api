import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEntity } from './entities/webhook.entity';

@Injectable()
export class WebhooksService {
  constructor(
  @InjectRepository(WebhookEntity)
  private readonly webhookRepository: Repository<WebhookEntity>,
) {}
  private readonly logger = new Logger(WebhooksService.name);

  /**
   * Register a new webhook subscription
   */
  async register(
  principalId: string,
  url: string,
  events: ('link.created' | 'link.clicked')[],
): Promise<WebhookEntity> {
  const webhook = this.webhookRepository.create({
    principal_id: principalId,
    url,
    events,
  });

  return this.webhookRepository.save(webhook);
}

  /**
   * Get all webhooks for a given principal
   */
  async findByPrincipal(
  principalId: string,
): Promise<WebhookEntity[]> {
  return this.webhookRepository.find({
    where: { principal_id: principalId },
    order: { createdAt: 'DESC' },
  });
}
  /**
   * Dispatch webhook events
   */
  async dispatch(
  principalId: string,
  event: 'link.created' | 'link.clicked',
  payload: Record<string, any>,
): Promise<void> {
  const subscribers = await this.webhookRepository.find({
    where: { principal_id: principalId },
  });

  const activeSubscribers = subscribers.filter((w) =>
    w.events.includes(event),
  );

  for (const sub of activeSubscribers) {
    this.logger.log(
      `[Webhook] Dispatching ${event} to ${sub.url}`,
    );

    fetch(sub.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        timestamp: new Date(),
        data: payload,
      }),
    }).catch((err) => {
      this.logger.error(
        `Delivery failed: ${err.message}`,
      );
    });
  }
}
}