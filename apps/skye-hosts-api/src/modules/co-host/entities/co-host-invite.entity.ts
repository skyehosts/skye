import type {
  CoHostInviteStatus,
  CoHostRole,
} from '@repo/skye-hosts-api-client';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CoHostInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  listingId: number;

  @Column({ type: 'integer' })
  inviterAccountId: number;

  @Column({ type: 'character varying' })
  inviteeEmail: string;

  @Column({ type: 'character varying' })
  role: CoHostRole;

  @Column({ type: 'character varying', default: 'pending' })
  status: CoHostInviteStatus;

  @Column({ type: 'character varying' })
  tokenHash: string;

  @Column({ type: 'timestamp without time zone' })
  expiresAt: Date;

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;
}
