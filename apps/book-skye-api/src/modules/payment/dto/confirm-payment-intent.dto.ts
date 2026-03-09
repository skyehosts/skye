import { IConfirmPaymentIntentRequestDto } from '@repo/book-skye-api-client';

export class ConfirmPaymentIntentRequestDto implements IConfirmPaymentIntentRequestDto {
  paymentIntentId: string;
}
