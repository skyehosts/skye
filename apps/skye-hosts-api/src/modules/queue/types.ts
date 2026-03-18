export enum AwsQueueNames {
  BOOKINGS = 'bookings',
  LISTING_IMAGE_PROCESSING = 'image-processing',
  SCHEDULED_MESSAGES = 'scheduled-messages',
}

class AwsQueue {
  constructor(public name: AwsQueueNames) {}
}

export const azureServiceBusQueues = [new AwsQueue(AwsQueueNames.BOOKINGS)];

export enum AwsQueueMessageAction {
  BOOKING_PAYMENT_SUCCESSFUL = 'booking_payment_successful',
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AwsQueueBaseMessageBody {}
