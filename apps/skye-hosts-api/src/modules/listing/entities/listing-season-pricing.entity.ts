import type { PricingSeasonId } from '@repo/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Listing } from './listing.entity';

@Entity()
@Unique(['listingId', 'season'])
export class ListingSeasonPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'integer' })
  listingId: number;

  @Column({ type: 'character varying' })
  season: PricingSeasonId;

  @Column({ type: 'integer' })
  weekdayPricePence: number;

  @Column({ type: 'integer' })
  weekendPricePence: number;

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp without time zone' })
  updatedAt: Date;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;
}
