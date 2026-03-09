import { ICreatePaymentIntentRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class CreatePaymentIntentRequestDto implements ICreatePaymentIntentRequestDto {
  @IsString()
  paymentMethodId: string;

  saveCard: boolean;
}
