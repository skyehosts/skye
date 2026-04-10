import type {
  CalendarSyncImportStatus,
  CalendarSyncPlatform,
} from '@repo/skye-hosts-api-client';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index(['listingId'])
export class CalendarSync {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  listingId: number;

  @Column({ type: 'character varying' })
  platform: CalendarSyncPlatform;

  @Column({ type: 'character varying', nullable: true })
  label: string | null;

  @Column({ type: 'text' })
  importUrl: string;

  @Column({ type: 'character varying', unique: true })
  exportToken: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastExportedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastImportAt: Date | null;

  @Column({ type: 'character varying', nullable: true })
  lastImportStatus: CalendarSyncImportStatus | null;

  @Column({ type: 'text', nullable: true })
  lastImportError: string | null;

  @Column({ type: 'integer', nullable: true })
  lastImportEventCount: number | null;

  @Column({ type: 'integer', default: 0 })
  consecutiveFailures: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
