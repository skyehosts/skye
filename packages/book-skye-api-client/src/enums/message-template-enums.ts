export type MessageChannel = 'in_app';

export const MESSAGE_CHANNELS: MessageChannel[] = ['in_app'];

export type TriggerType =
  | 'booking_confirmed'
  | 'before_check_in'
  | 'before_checkout'
  | 'after_checkout';

export const TRIGGER_TYPES: TriggerType[] = [
  'booking_confirmed',
  'before_check_in',
  'before_checkout',
  'after_checkout',
];

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  booking_confirmed: 'On booking',
  before_check_in: '1 day before check-in',
  before_checkout: '1 day before check-out',
  after_checkout: 'After check-out',
};

export type OffsetUnit = 'hours' | 'days';

export const OFFSET_UNITS: OffsetUnit[] = ['hours', 'days'];

export type TemplateVersionStatus = 'draft' | 'active' | 'archived';

export const TEMPLATE_VERSION_STATUSES: TemplateVersionStatus[] = [
  'draft',
  'active',
  'archived',
];

export type ScheduledMessageStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'canceled';

export const SCHEDULED_MESSAGE_STATUSES: ScheduledMessageStatus[] = [
  'pending',
  'processing',
  'sent',
  'failed',
  'canceled',
];

export type MessageLogAction =
  | 'created'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'canceled'
  | 'retried';

export const MESSAGE_LOG_ACTIONS: MessageLogAction[] = [
  'created',
  'processing',
  'sent',
  'failed',
  'canceled',
  'retried',
];
