import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('links')
@Index(['code', 'domain'], { unique: true })
@Index(['principal_id'])
export class LinkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'text' })
  long_url: string;

  @Column({ type: 'varchar', length: 128 })
  principal_id: string;

  @Column({ type: 'integer', default: 0 })
  clicks_count: number;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at?: Date;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}