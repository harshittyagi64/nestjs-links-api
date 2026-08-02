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

@Index('IDX_LINKS_CREATED_AT', ['created_at'])
@Index('IDX_LINKS_CLICKS_COUNT', ['clicks_count'])
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

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}