import type { ScheduledMessageStatus } from '@repo/skye-hosts-api-client';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Booking } from '../../booking/entities';
import { Listing } from '../../listing/entities';
import { TemplateTrigger } from './template-trigger.entity';
import { TemplateVersion } from './template-version.entity';

@Entity()
@Unique(['idempotencyKey'])
@Index(['status', 'sendAt'])
export class ScheduledMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  bookingId: number;

  @Column({ type: 'integer' })
  listingId: number;

  @Column({ type: 'integer' })
  templateVersionId: number;

  @Column({ type: 'integer' })
  templateTriggerId: number;

  @Column({ type: 'timestamptz' })
  sendAt: Date;

  @Column({ type: 'character varying', default: 'pending' })
  status: ScheduledMessageStatus;

  @Column({ type: 'character varying' })
  idempotencyKey: string;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  lockedAt: Date | null;

  @Column({ type: 'character varying', nullable: true })
  lockedBy: string | null;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ManyToOne(() => TemplateVersion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'templateVersionId' })
  templateVersion: TemplateVersion;

  @ManyToOne(() => TemplateTrigger, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'templateTriggerId' })
  templateTrigger: TemplateTrigger;
}
