import type { NotificationEventType } from '@repo/skye-hosts-api-client';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../account/entities';

@Entity()
export class NotificationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  accountId: number;

  @Column({ type: 'character varying' })
  eventType: NotificationEventType;

  @Column({ type: 'character varying' })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'character varying' })
  status: 'sent' | 'failed';

  @Column({ type: 'character varying', nullable: true })
  expoTicketId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  expoResponse: Record<string, unknown> | null;

  @Column({ type: 'character varying', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'integer', default: 0 })
  attemptCount: number;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
