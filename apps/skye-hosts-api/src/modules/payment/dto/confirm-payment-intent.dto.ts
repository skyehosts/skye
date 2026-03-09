import { IConfirmPaymentIntentRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class ConfirmPaymentIntentRequestDto implements IConfirmPaymentIntentRequestDto {
  paymentIntentId: string;
}
