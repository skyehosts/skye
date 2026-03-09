import type {
  IUpdateNotificationPreferenceRequestDto,
  NotificationEventType,
} from '@repo/skye-hosts-api-client';
import { IsBoolean, IsIn, IsString } from 'class-validator';

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
