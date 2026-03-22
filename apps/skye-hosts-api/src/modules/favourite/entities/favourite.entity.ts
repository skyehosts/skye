import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { Listing } from '../../listing/entities';

@Entity()
@Unique(['accountId', 'listingId'])
export class Favourite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  accountId: number;

  @Column({ type: 'integer' })
  listingId: number;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;
}
