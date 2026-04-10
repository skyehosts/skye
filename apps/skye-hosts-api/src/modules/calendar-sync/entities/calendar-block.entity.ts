import type { CalendarBlockSource } from '@repo/skye-hosts-api-client';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CalendarSync } from './calendar-sync.entity';

@Entity()
@Index(['listingId', 'startDate', 'endDate'])
@Index(['calendarSyncId', 'externalUid'])
export class CalendarBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  listingId: number;

  @Column({ type: 'integer', nullable: true })
  calendarSyncId: number | null;

  @Column({ type: 'character varying' })
  source: CalendarBlockSource;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'character varying', nullable: true })
  summary: string | null;

  @Column({ type: 'character varying', nullable: true })
  externalUid: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => CalendarSync, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'calendarSyncId' })
  calendarSync: CalendarSync | null;
}
