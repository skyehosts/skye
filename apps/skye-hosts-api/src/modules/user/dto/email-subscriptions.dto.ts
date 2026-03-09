import { IsBoolean } from 'class-validator';
import {
  IGetEmailSubscriptionsResponseDto,
  ISaveEmailSubscriptionsRequestDto,
} from '../../../../../../packages/skye-hosts-api-client/src';

export class SaveEmailSubscriptionsRequestDto implements ISaveEmailSubscriptionsRequestDto {
  @IsBoolean()
  subscribedToNewsViaEmail: boolean;
}

export class GetEmailSubscriptionsResponseDto implements IGetEmailSubscriptionsResponseDto {
  subscribedToNewsViaEmail: boolean;
}
