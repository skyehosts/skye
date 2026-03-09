export type NotificationEventType =
  | 'booking_requested'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'message_received';

export interface INotificationPreferenceDto {
  eventType: NotificationEventType;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface IGetNotificationPreferencesResponseDto {
  preferences: INotificationPreferenceDto[];
}

export interface IUpdateNotificationPreferenceRequestDto {
  eventType: NotificationEventType;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface IUpdateNotificationPreferenceResponseDto {
  preference: INotificationPreferenceDto;
}
