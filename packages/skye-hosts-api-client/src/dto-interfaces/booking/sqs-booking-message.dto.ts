export interface ISqsBookingMessageDto {
  bookingId: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
}
