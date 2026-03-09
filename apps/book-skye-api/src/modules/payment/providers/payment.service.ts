import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IPaymentIntentResponseDto } from '@repo/skye-hosts-api-client';
import Stripe from 'stripe';
import { AccountService } from '../../account/providers';
import { StripeService } from '../../stripe/providers';
import {
  ConfirmPaymentIntentRequestDto,
  CreatePaymentIntentRequestDto,
} from '../dto';

@Injectable()
export class PaymentService {
  constructor(
    private accountService: AccountService,
    private stripeService: StripeService,
  ) {}

  mapIntentStatus(intent: Stripe.Response<Stripe.PaymentIntent>) {
    if (intent.status === 'requires_payment_method') {
      return { errorMessage: 'Your card was denied.' };
    }
    if (intent.status === 'succeeded') {
      return {
        intentClientSecret: intent.client_secret,
      };
    }
    if (intent.status === 'requires_action') {
      // User must complete 2FA
      return {
        intentClientSecret: intent.client_secret,
        requiresAction: true,
        paymentIntentId: intent.id,
      };
    }
    throw new InternalServerErrorException(
      'Unknown stripe payment intent status.',
    );
  }

  async confirmIntent(
    dto: ConfirmPaymentIntentRequestDto,
  ): Promise<IPaymentIntentResponseDto> {
    const intent = await this.stripeService.confirmPaymentIntent(
      dto.paymentIntentId,
    );
    return this.mapIntentStatus(intent);
  }

  async createIntent(
    dto: CreatePaymentIntentRequestDto,
    accountId: number,
  ): Promise<IPaymentIntentResponseDto> {
    const account = await this.accountService.findById(accountId);
    const params = {
      amount: 100,
      currency: 'usd',
      payment_method: dto.paymentMethodId,
      confirm: true,
      confirmation_method: 'manual',
    } as any; // TODO temp using any as types not exported correctly from stripe package
    if (dto.saveCard) {
      params.setup_future_usage = 'off_session';
    }
    const intent = await this.stripeService.createPaymentIntent(
      account.stripeCustomerId,
      params,
    );
    return this.mapIntentStatus(intent);
  }
}
