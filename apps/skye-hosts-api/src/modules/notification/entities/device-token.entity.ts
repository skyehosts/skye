import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Account } from '../../account/entities';

@Entity()
@Unique(['token'])
export class DeviceToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  accountId: number;

  @Column({ type: 'character varying' })
  token: string;

  @Column({ type: 'character varying' })
  platform: 'ios' | 'android';

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
