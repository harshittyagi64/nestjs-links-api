import { Injectable, Logger } from '@nestjs/common';
import { Webhook } from './interfaces/webhook.interface';

@Injectable()
export class WebhooksService {
  private webhooks: Webhook[] = [];
  private readonly logger = new Logger(WebhooksService.name);

  /**
   * Register a new webhook subscription
   */
  async register(
    principalId: string,
    url: string,
    events: ('link.created' | 'link.clicked')[],
  ): Promise<Webhook> {
    const webhook: Webhook = {
      id: this.webhooks.length + 1,
      principal_id: principalId,
      url,
      events,
      createdAt: new Date(),
    };

    this.webhooks.push(webhook);

    return webhook;
  }

  /**
   * Get all webhooks for a given principal
   */
  async findByPrincipal(
    principalId: string,
  ): Promise<Webhook[]> {
    return this.webhooks.filter(
      (w) => w.principal_id === principalId,
    );
  }

  /**
   * Dispatch webhook events
   */
  async dispatch(
    principalId: string,
    event: 'link.created' | 'link.clicked',
    payload: Record<string, any>,
  ): Promise<void> {
    const subscribers = this.webhooks.filter(
      (w) =>
        w.principal_id === principalId &&
        w.events.includes(event),
    );

    for (const sub of subscribers) {
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