import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ScheduledMessage } from './scheduled-message.entity';

@Entity()
export class SentMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  scheduledMessageId: number;

  @Column({ type: 'text' })
  renderedContent: string;

  @Column({ type: 'jsonb', nullable: true })
  deliveryMetadata: Record<string, unknown> | null;

  @Column({ type: 'timestamptz' })
  sentAt: Date;

  @ManyToOne(() => ScheduledMessage)
  @JoinColumn({ name: 'scheduledMessageId' })
  scheduledMessage: ScheduledMessage;
}
