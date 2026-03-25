import type { IAccountVm, UserRole } from '@repo/skye-hosts-api-client';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Account {
  @Column({
    nullable: true,
    type: 'boolean',
  })
  cookieUsageEnabled: boolean;

  @Column({
    type: 'timestamp without time zone',
  })
  dateJoined: Date;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  email: string | null;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'timestamp without time zone',
  })
  lastLoggedIn: Date;

  @Column({
    type: 'character varying',
  })
  name: string;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  passwordHash: string | null;

  @Column({
    type: 'character varying',
    default: 'guest',
  })
  role: UserRole;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  passwordResetToken: string | null;

  @Column({
    nullable: true,
    type: 'timestamp without time zone',
  })
  passwordResetTokenExpiry: Date | null;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  phoneNumber: string | null;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  pinHash: string | null;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  profilePhotoKey: string | null;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  pinSalt: string | null;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  refreshTokenHash: string | null;

  @Column({
    nullable: true,
    type: 'timestamp without time zone',
  })
  refreshTokenExpiry: Date | null;

  @Column({
    nullable: true,
    type: 'character varying',
  })
  stripeCustomerId: string | null;

  @Column({
    type: 'boolean',
    default: true,
  })
  searchEngineIndexingEnabled: boolean;

  @Column({
    nullable: false,
    type: 'boolean',
  })
  subscribedToNewsViaEmail: boolean;

  mapToViewModel(): IAccountVm {
    return {
      dateJoined: this.dateJoined,
      email: this.email,
      id: this.id,
      name: this.name,
    };
  }
}
