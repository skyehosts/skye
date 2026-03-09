import { Account } from '../modules/account/entities';
import { Booking } from '../modules/booking/entities';
import { Demo } from '../modules/demo/entities';
import { Listing } from '../modules/listing/entities';
import { Message } from '../modules/message/entities';
import {
  DeviceToken,
  NotificationHistory,
  NotificationPreference,
} from '../modules/notification/entities';
import {
  ListingMessageTemplate,
  MessageLog,
  MessageTemplate,
  ScheduledMessage,
  SentMessage,
  TemplateTrigger,
  TemplateVersion,
} from '../modules/scheduled-message/entities';

export const entities = [
  Account,
  Booking,
  Demo,
  DeviceToken,
  Listing,
  ListingMessageTemplate,
  Message,
  MessageLog,
  NotificationHistory,
  NotificationPreference,
  MessageTemplate,
  ScheduledMessage,
  SentMessage,
  TemplateTrigger,
  TemplateVersion,
];
