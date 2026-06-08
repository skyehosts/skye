import type { IPriceBreakdownDto } from '@repo/common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../account/entities';
import { Listing } from '../../listing/entities';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  listingId: number;

  @Column({ type: 'integer' })
  guestId: number;

  @Column({ type: 'date' })
  checkInDate: string;

  @Column({ type: 'date' })
  checkOutDate: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'integer', default: 1 })
  numberOfGuests: number;

  @Column({ type: 'character varying', default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true, default: null })
  priceBreakdown: IPriceBreakdownDto | null;

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'guestId' })
  guest: Account;
}
