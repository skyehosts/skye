import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Listing } from './listing.entity';

@Entity()
export class ListingPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  listingId: number;

  @Column({ type: 'integer', default: 0 })
  cleaningFeePound: number;

  @Column({ type: 'integer', default: 0 })
  extraGuestThreshold: number;

  @Column({ type: 'integer', default: 0 })
  extraGuestFeePence: number;

  @Column({ type: 'boolean', default: false })
  lastMinuteEnabled: boolean;

  @Column({ type: 'integer', default: 5 })
  lastMinutePercent: number;

  @Column({ type: 'boolean', default: false })
  weeklyEnabled: boolean;

  @Column({ type: 'integer', default: 10 })
  weeklyPercent: number;

  @Column({ type: 'boolean', default: false })
  monthlyEnabled: boolean;

  @Column({ type: 'integer', default: 20 })
  monthlyPercent: number;

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp without time zone' })
  updatedAt: Date;

  @OneToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;
}
