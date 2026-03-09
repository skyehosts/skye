import { IsString } from 'class-validator';
import { ICreatePaymentIntentRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class CreatePaymentIntentRequestDto implements ICreatePaymentIntentRequestDto {
  @IsString()
  paymentMethodId: string;

  saveCard: boolean;
}
