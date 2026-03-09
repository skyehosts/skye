import type { NotificationEventType } from '@repo/skye-hosts-api-client';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Account } from '../../account/entities';

@Entity()
@Unique(['accountId', 'eventType'])
export class NotificationPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  accountId: number;

  @Column({ type: 'character varying' })
  eventType: NotificationEventType;

  @Column({ type: 'boolean', default: true })
  pushEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  emailEnabled: boolean;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
