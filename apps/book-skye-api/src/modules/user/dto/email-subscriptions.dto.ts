import {
  IGetEmailSubscriptionsResponseDto,
  ISaveEmailSubscriptionsRequestDto,
} from '@repo/book-skye-api-client';
import { IsBoolean } from 'class-validator';

export class SaveEmailSubscriptionsRequestDto implements ISaveEmailSubscriptionsRequestDto {
  @IsBoolean()
  subscribedToNewsViaEmail: boolean;
}

export class GetEmailSubscriptionsResponseDto implements IGetEmailSubscriptionsResponseDto {
  subscribedToNewsViaEmail: boolean;
}
