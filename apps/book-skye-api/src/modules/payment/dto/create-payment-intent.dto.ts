import { ICreatePaymentIntentRequestDto } from '@repo/book-skye-api-client';
import { IsString } from 'class-validator';

export class CreatePaymentIntentRequestDto implements ICreatePaymentIntentRequestDto {
  @IsString()
  paymentMethodId: string;

  saveCard: boolean;
}
