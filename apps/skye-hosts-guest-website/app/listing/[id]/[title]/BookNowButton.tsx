'use client';

import {
  fetchApi,
  IBookingPaymentRequestDto,
  IBookingPaymentResponseDto,
} from '@repo/skye-hosts-api-client';
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

  const handleBook = async (isTestBooking: boolean) => {
    setStatus('loading');
    try {
      let finalCheckIn = checkInAt;
      let finalCheckOut = checkOutAt;

      if (isTestBooking) {
        const now = Date.now();
        finalCheckIn = new Date(now + 2 * 60 * 1000).toISOString();
        finalCheckOut = new Date(now + 4 * 60 * 1000).toISOString();
      }

      const result = await fetchApi<
        IBookingPaymentResponseDto,
        IBookingPaymentRequestDto
      >('/payment/process-booking-payment', {
        listingId,
        guestId,
        checkInAt: finalCheckIn,
        checkOutAt: finalCheckOut,
        totalPrice,
        ...(isTestBooking && { isTestBooking: true }),
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
      <button onClick={() => handleBook(false)} disabled={status === 'loading'}>
        {status === 'loading' ? 'Processing...' : 'Book Now'}
      </button>
      {process.env.NODE_ENV !== 'production' && (
        <button
          onClick={() => handleBook(true)}
          disabled={status === 'loading'}
          style={{
            marginLeft: 8,
            backgroundColor: '#f59e0b',
            color: '#000',
            padding: '4px 12px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {status === 'loading'
            ? 'Processing...'
            : 'Test Book (Scheduled Msgs)'}
        </button>
      )}
      {status === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
