import { Account } from '../modules/account/entities';
import { Booking } from '../modules/booking/entities';
import { CoHostInvite, ListingUserRole } from '../modules/co-host/entities';
import { Demo } from '../modules/demo/entities';
import { ListingImage } from '../modules/listing-image/entities';
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
  CoHostInvite,
  Demo,
  DeviceToken,
  Listing,
  ListingImage,
  ListingMessageTemplate,
  ListingUserRole,
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
