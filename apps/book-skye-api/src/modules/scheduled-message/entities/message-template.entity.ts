import type { MessageChannel } from '@repo/skye-hosts-api-client';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../account/entities';

@Entity()
export class MessageTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  hostId: number;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying', default: 'in_app' })
  channel: MessageChannel;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'hostId' })
  host: Account;
}
