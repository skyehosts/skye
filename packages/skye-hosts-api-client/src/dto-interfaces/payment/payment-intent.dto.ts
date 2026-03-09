export interface IPaymentIntentResponseDto {
  intentClientSecret?: string;
  errorMessage?: string;
  paymentIntentId?: string;
  requiresAction?: boolean;
}
