import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Listing } from '../../listing/entities';
import { MessageTemplate } from './message-template.entity';

@Entity()
@Unique(['listingId', 'messageTemplateId'])
export class ListingMessageTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  listingId: number;

  @Column({ type: 'integer' })
  messageTemplateId: number;

  @Column({ type: 'timestamptz' })
  attachedAt: Date;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ManyToOne(() => MessageTemplate)
  @JoinColumn({ name: 'messageTemplateId' })
  messageTemplate: MessageTemplate;
}
