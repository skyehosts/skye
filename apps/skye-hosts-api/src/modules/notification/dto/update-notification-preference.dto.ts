import { IsBoolean, IsIn, IsString } from 'class-validator';
import type {
  IUpdateNotificationPreferenceRequestDto,
  NotificationEventType,
} from '../../../../../../packages/skye-hosts-api-client/src';

const EVENT_TYPES: NotificationEventType[] = [
  'booking_requested',
  'booking_confirmed',
  'booking_cancelled',
  'message_received',
];

export class UpdateNotificationPreferenceRequestDto implements IUpdateNotificationPreferenceRequestDto {
  @IsString()
  @IsIn(EVENT_TYPES)
  eventType: NotificationEventType;

  @IsBoolean()
  pushEnabled: boolean;

  @IsBoolean()
  emailEnabled: boolean;
}
