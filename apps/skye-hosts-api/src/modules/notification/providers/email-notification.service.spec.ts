import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '../../account/entities/account.entity';
import { EmailTemplate } from '../../email/enums/email-template.enum';
import { ResendService } from '../../email/providers/resend.service';
import { NotificationPreference } from '../entities';
import { EmailNotificationService } from './email-notification.service';

describe('EmailNotificationService', () => {
  let service: EmailNotificationService;
  let preferenceRepo: { findOne: jest.Mock };
  let accountRepo: { findOne: jest.Mock };
  let resendService: { sendTemplate: jest.Mock };

  beforeEach(async () => {
    preferenceRepo = { findOne: jest.fn() };
    accountRepo = { findOne: jest.fn() };
    resendService = { sendTemplate: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailNotificationService,
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: preferenceRepo,
        },
        { provide: getRepositoryToken(Account), useValue: accountRepo },
        { provide: ResendService, useValue: resendService },
      ],
    }).compile();

    service = module.get<EmailNotificationService>(EmailNotificationService);
  });

  it('skips send when email notifications are disabled for the event', async () => {
    preferenceRepo.findOne.mockResolvedValue({ emailEnabled: false });

    await service.send({
      recipientAccountId: 1,
      eventType: 'booking_confirmed',
      title: 'Booking confirmed',
      body: 'Your booking is confirmed',
    });

    expect(resendService.sendTemplate).not.toHaveBeenCalled();
  });

  it('skips send when account has no email address', async () => {
    preferenceRepo.findOne.mockResolvedValue(null); // defaults to enabled
    accountRepo.findOne.mockResolvedValue({ id: 1, name: 'Jane', email: null });

    await service.send({
      recipientAccountId: 1,
      eventType: 'booking_confirmed',
      title: 'Booking confirmed',
      body: 'Your booking is confirmed',
    });

    expect(resendService.sendTemplate).not.toHaveBeenCalled();
  });

  it('sends the correct template and variables for booking_confirmed', async () => {
    preferenceRepo.findOne.mockResolvedValue(null);
    accountRepo.findOne.mockResolvedValue({
      id: 1,
      name: 'Jane',
      email: 'jane@example.com',
    });

    await service.send({
      recipientAccountId: 1,
      eventType: 'booking_confirmed',
      title: 'Booking confirmed',
      body: 'Your booking is confirmed',
      data: { bookingId: 42, url: 'https://example.com/bookings/42' },
    });

    expect(resendService.sendTemplate).toHaveBeenCalledWith(
      'jane@example.com',
      EmailTemplate.BookingConfirmed,
      {
        recipientName: 'Jane',
        title: 'Booking confirmed',
        body: 'Your booking is confirmed',
        bookingId: '42',
        url: 'https://example.com/bookings/42',
      },
    );
  });

  it('sends the correct template for message_received', async () => {
    preferenceRepo.findOne.mockResolvedValue(null);
    accountRepo.findOne.mockResolvedValue({
      id: 2,
      name: 'Bob',
      email: 'bob@example.com',
    });

    await service.send({
      recipientAccountId: 2,
      eventType: 'message_received',
      title: 'New message',
      body: 'Hi, quick question…',
      data: { bookingId: 7, conversationUrl: 'https://example.com/messages/7' },
    });

    expect(resendService.sendTemplate).toHaveBeenCalledWith(
      'bob@example.com',
      EmailTemplate.MessageReceived,
      expect.objectContaining({
        recipientName: 'Bob',
        bookingId: '7',
        conversationUrl: 'https://example.com/messages/7',
      }),
    );
  });

  it('does not throw when resendService rejects — error is swallowed', async () => {
    preferenceRepo.findOne.mockResolvedValue(null);
    accountRepo.findOne.mockResolvedValue({
      id: 1,
      name: 'Jane',
      email: 'jane@example.com',
    });
    resendService.sendTemplate.mockRejectedValue(new Error('API error'));

    await expect(
      service.send({
        recipientAccountId: 1,
        eventType: 'booking_confirmed',
        title: 'Booking confirmed',
        body: 'Body',
      }),
    ).resolves.toBeUndefined();
  });
});
