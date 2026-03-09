import { Injectable } from '@nestjs/common';
import type { UserRole } from '@repo/skye-hosts-api-client';
import { DeleteResult } from 'typeorm';
import { DatabaseService } from '../../common/providers';
import { StripeService } from '../../stripe/providers';
import { Account } from '../entities';

@Injectable()
export class AccountService {
  constructor(
    private databaseService: DatabaseService,
    private stripeService: StripeService,
  ) {}

  async create(
    email: string,
    name: string,
    passwordHash: string,
    role: UserRole,
    subscribedToNewsViaEmail: boolean,
  ): Promise<Account> {
    const repo = this.databaseService.getRepository(Account);

    // Deliberately creating customer before saving account so that worst case
    // we have an unassociated customer rather than an account without a customer.
    const stripeCustomer = await this.stripeService.createCustomer();
    const timestamp = new Date();

    return repo.save({
      dateJoined: timestamp,
      email: email,
      lastLoggedIn: timestamp,
      name: name,
      passwordHash: passwordHash,
      role: role,
      stripeCustomerId: stripeCustomer.id,
      subscribedToNewsViaEmail: subscribedToNewsViaEmail,
    } as Account);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.databaseService.getRepository(Account).delete(id);
  }

  async findById(id: number) {
    return this.databaseService.getRepository(Account).findOne({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return this.databaseService.getRepository(Account).findOne({
      where: {
        email,
      },
    });
  }

  async createFromPhone(phoneNumber: string, name: string): Promise<Account> {
    const repo = this.databaseService.getRepository(Account);
    const timestamp = new Date();

    return repo.save({
      dateJoined: timestamp,
      lastLoggedIn: timestamp,
      name: name,
      phoneNumber: phoneNumber,
      role: 'host',
      subscribedToNewsViaEmail: false,
    } as Account);
  }

  async findByPhoneNumber(phoneNumber: string) {
    return this.databaseService.getRepository(Account).findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async findByResetToken(token: string) {
    return this.databaseService.getRepository(Account).findOne({
      where: {
        passwordResetToken: token,
      },
    });
  }

  async save(account: Account) {
    return this.databaseService.getRepository(Account).save(account);
  }
}
