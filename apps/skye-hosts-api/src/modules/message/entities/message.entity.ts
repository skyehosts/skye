import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../account/entities';
import { Booking } from '../../booking/entities';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  bookingId: number;

  @Column({ type: 'integer' })
  senderId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp without time zone', nullable: true })
  readAt: Date | null;

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'senderId' })
  sender: Account;
}
