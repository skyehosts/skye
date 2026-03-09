import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../../config/providers/config.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const { stripeSecret } = this.configService.getAll();
    this.stripe = new Stripe(stripeSecret, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }

  async createCustomer(): Promise<Stripe.Response<Stripe.Customer>> {
    const params: Stripe.CustomerCreateParams = {};
    return this.stripe.customers.create(params);
  }

  async retrieveCustomer(
    customerId: string,
  ): Promise<Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>> {
    return this.stripe.customers.retrieve(customerId);
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  async createPaymentIntent(
    customerId: string,
    params: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const customer = await this.retrieveCustomer(customerId);
    return this.stripe.paymentIntents.create({
      ...params,
      customer: customer.id,
    });
  }
}
