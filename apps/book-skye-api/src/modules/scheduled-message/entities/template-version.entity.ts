import type { TemplateVersionStatus } from '@repo/skye-hosts-api-client';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageTemplate } from './message-template.entity';

@Entity()
export class TemplateVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  messageTemplateId: number;

  @Column({ type: 'integer' })
  versionNumber: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'character varying', default: 'draft' })
  status: TemplateVersionStatus;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => MessageTemplate)
  @JoinColumn({ name: 'messageTemplateId' })
  messageTemplate: MessageTemplate;
}
