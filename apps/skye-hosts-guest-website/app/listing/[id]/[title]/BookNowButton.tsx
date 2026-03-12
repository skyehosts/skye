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
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
}

export function BookNowButton({
  listingId,
  guestId,
  checkInDate,
  checkOutDate,
  totalPrice,
}: BookNowButtonProps) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleBook = async (isTestBooking: boolean) => {
    setStatus('loading');
    try {
      let finalCheckIn = checkInDate;
      let finalCheckOut = checkOutDate;

      if (isTestBooking) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        finalCheckIn = tomorrow.toISOString().slice(0, 10);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        finalCheckOut = dayAfter.toISOString().slice(0, 10);
      }

      const result = await fetchApi<
        IBookingPaymentResponseDto,
        IBookingPaymentRequestDto
      >('/payment/process-booking-payment', {
        listingId,
        guestId,
        checkInDate: finalCheckIn,
        checkOutDate: finalCheckOut,
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
            backgroundColor: '#E9B949',
            color: '#1F3F4A',
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
      {status === 'success' && <p style={{ color: '#3F9C5A' }}>{message}</p>}
      {status === 'error' && <p style={{ color: '#FF3B30' }}>{message}</p>}
    </div>
  );
}
