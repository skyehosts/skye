import type { OffsetUnit, TriggerType } from '@repo/skye-hosts-api-client';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageTemplate } from './message-template.entity';

@Entity()
export class TemplateTrigger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  messageTemplateId: number;

  @Column({ type: 'character varying' })
  triggerType: TriggerType;

  @Column({ type: 'integer' })
  offsetValue: number;

  @Column({ type: 'character varying' })
  offsetUnit: OffsetUnit;

  @Column({ type: 'boolean', default: false })
  allowMultiplePerBooking: boolean;

  @Column({ type: 'boolean', default: true })
  sendIfPast: boolean;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => MessageTemplate)
  @JoinColumn({ name: 'messageTemplateId' })
  messageTemplate: MessageTemplate;
}
