'use client';

import {
  fetchApi,
  IBookingPaymentRequestDto,
  IBookingPaymentResponseDto,
} from '@repo/book-skye-api-client';
import { useState } from 'react';

interface BookNowButtonProps {
  listingId: number;
  guestId: number;
  checkInAt: string;
  checkOutAt: string;
  totalPrice: number;
}

export function BookNowButton({
  listingId,
  guestId,
  checkInAt,
  checkOutAt,
  totalPrice,
}: BookNowButtonProps) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleClick = async () => {
    setStatus('loading');
    try {
      const result = await fetchApi<
        IBookingPaymentResponseDto,
        IBookingPaymentRequestDto
      >('/payment/process-booking-payment', {
        listingId,
        guestId,
        checkInAt,
        checkOutAt,
        totalPrice,
      });
      setStatus('success');
      setMessage(result.message);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={status === 'loading'}>
        {status === 'loading' ? 'Processing...' : 'Book Now'}
      </button>
      {status === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
