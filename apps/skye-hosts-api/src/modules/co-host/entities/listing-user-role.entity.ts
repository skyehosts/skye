import type { CoHostRole } from '@repo/skye-hosts-api-client';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['accountId', 'listingId'])
export class ListingUserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  accountId: number;

  @Column({ type: 'integer' })
  listingId: number;

  @Column({ type: 'character varying' })
  role: CoHostRole;

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;
}
