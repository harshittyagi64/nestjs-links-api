import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LinkEntity } from './link.entity';

@Entity('click_logs')
@Index(['link_id']) // Indexed for quick analytics lookups by link ID
export class ClickLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  link_id: number;

  @Column({ type: 'varchar', length: 32, default: 'other' })
  device_type: 'desktop' | 'mobile' | 'bot' | 'other';

  @Column({ type: 'text', nullable: true })
  referrer?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => LinkEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'link_id' })
  link: LinkEntity;
}