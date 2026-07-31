import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('webhooks')
@Index(['principal_id']) // Fast tenant-scoped webhook lookup
export class WebhookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 128 })
  principal_id: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text', array: true })
  events: ('link.created' | 'link.clicked')[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}