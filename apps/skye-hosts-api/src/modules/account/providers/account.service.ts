import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { UserRole } from '@repo/skye-hosts-api-client';
import { DeleteResult, Repository } from 'typeorm';
import { StripeService } from '../../stripe/providers';
import { Account } from '../entities';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private stripeService: StripeService,
  ) {}

  async create(
    email: string,
    name: string,
    passwordHash: string,
    role: UserRole,
    subscribedToNewsViaEmail: boolean,
  ): Promise<Account> {
    // Deliberately creating customer before saving account so that worst case
    // we have an unassociated customer rather than an account without a customer.
    const stripeCustomer = await this.stripeService.createCustomer();
    const timestamp = new Date();

    return this.accountRepo.save({
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
    return this.accountRepo.delete(id);
  }

  async findById(id: number) {
    return this.accountRepo.findOne({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return this.accountRepo.findOne({
      where: {
        email,
      },
    });
  }

  async createFromPhone(
    phoneNumber: string,
    name: string,
    email?: string,
  ): Promise<Account> {
    const timestamp = new Date();

    return this.accountRepo.save({
      dateJoined: timestamp,
      lastLoggedIn: timestamp,
      name: name,
      phoneNumber: phoneNumber,
      role: 'host',
      subscribedToNewsViaEmail: false,
      ...(email ? { email } : {}),
    } as Account);
  }

  async findByPhoneNumber(phoneNumber: string) {
    return this.accountRepo.findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async findByResetToken(token: string) {
    return this.accountRepo.findOne({
      where: {
        passwordResetToken: token,
      },
    });
  }

  async save(account: Account) {
    return this.accountRepo.save(account);
  }
}
