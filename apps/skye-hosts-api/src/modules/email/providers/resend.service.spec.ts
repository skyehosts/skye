import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../../config/providers/config.service';
import { EmailTemplate } from '../enums/email-template.enum';
import { ResendService } from './resend.service';

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  };
});

describe('ResendService', () => {
  let service: ResendService;
  let emailsSend: jest.Mock;

  const buildModule = async (opts: {
    disabled?: boolean;
    apiKey?: string;
    fromEmail?: string;
  }) => {
    const { Resend } = await import('resend');
    emailsSend = jest.fn();
    (Resend as jest.Mock).mockImplementation(() => ({
      emails: { send: emailsSend },
    }));

    process.env.RESEND_DISABLED = opts.disabled ? 'true' : 'false';

    const configService = {
      getAll: jest.fn().mockReturnValue({
        resendApiKey: opts.apiKey ?? 'test-key',
        resendFromEmail: opts.fromEmail ?? 'noreply@skyehosts.co.uk',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    return module.get<ResendService>(ResendService);
  };

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.RESEND_DISABLED;
  });

  describe('bypass mode', () => {
    it('should skip send and not throw', async () => {
      service = await buildModule({ disabled: true });

      await expect(
        service.sendTemplate(
          'test@example.com',
          EmailTemplate.BookingConfirmed,
          { recipientName: 'Jane', title: 'Booking confirmed', body: 'Done' },
        ),
      ).resolves.toBeUndefined();

      expect(emailsSend).not.toHaveBeenCalled();
    });
  });

  describe('missing config', () => {
    it('should throw when RESEND_API_KEY is missing', async () => {
      await expect(
        buildModule({ apiKey: '', fromEmail: 'noreply@skyehosts.co.uk' }),
      ).rejects.toThrow('RESEND_API_KEY is not defined');
    });

    it('should throw when RESEND_FROM_EMAIL is missing', async () => {
      await expect(
        buildModule({ apiKey: 'test-key', fromEmail: '' }),
      ).rejects.toThrow('RESEND_FROM_EMAIL is not defined');
    });
  });

  describe('production mode', () => {
    beforeEach(async () => {
      service = await buildModule({});
    });

    it('should call Resend with correct payload', async () => {
      emailsSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });

      await service.sendTemplate(
        'guest@example.com',
        EmailTemplate.MessageReceived,
        { recipientName: 'Jane', title: 'New message', body: 'Hello' },
      );

      expect(emailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@skyehosts.co.uk',
          to: 'guest@example.com',
          template: {
            id: EmailTemplate.MessageReceived,
            variables: {
              recipientName: 'Jane',
              title: 'New message',
              body: 'Hello',
            },
          },
        }),
      );
    });

    it('should throw when Resend returns an error', async () => {
      emailsSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key', name: 'validation_error' },
      });

      await expect(
        service.sendTemplate(
          'guest@example.com',
          EmailTemplate.BookingConfirmed,
          { title: 'Test', body: 'Body' },
        ),
      ).rejects.toThrow('Resend request failed: Invalid API key');
    });
  });
});
