export interface Webhook {
  id: number;
 principal_id: string;
  url: string;
  events: ('link.created' | 'link.clicked')[];
  createdAt: Date;
}