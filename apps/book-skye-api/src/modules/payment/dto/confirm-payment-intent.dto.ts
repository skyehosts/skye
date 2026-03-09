import { IConfirmPaymentIntentRequestDto } from '@repo/skye-hosts-api-client';

export class ConfirmPaymentIntentRequestDto implements IConfirmPaymentIntentRequestDto {
  paymentIntentId: string;
}
