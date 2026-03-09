import type { MessageLogAction } from '@repo/skye-hosts-api-client';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ScheduledMessage } from './scheduled-message.entity';

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  scheduledMessageId: number;

  @Column({ type: 'character varying' })
  action: MessageLogAction;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => ScheduledMessage)
  @JoinColumn({ name: 'scheduledMessageId' })
  scheduledMessage: ScheduledMessage;
}
