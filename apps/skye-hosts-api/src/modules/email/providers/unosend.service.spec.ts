import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplate } from '../enums/email-template.enum';
import { UnoSendService } from './unosend.service';

describe('UnoSendService', () => {
  let service: UnoSendService;
  let fetchMock: jest.Mock;

  const buildModule = async (env: string) => {
    process.env.SKYE_ENVIRONMENT = env;
    process.env.UNOSEND_API_KEY = 'test-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [UnoSendService],
    }).compile();

    return module.get<UnoSendService>(UnoSendService);
  };

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.SKYE_ENVIRONMENT;
    delete process.env.UNOSEND_API_KEY;
  });

  describe('bypass mode (local env)', () => {
    it('should skip fetch and not throw', async () => {
      service = await buildModule('local');

      await expect(
        service.sendTemplate(
          'test@example.com',
          EmailTemplate.BookingConfirmed,
          { recipientName: 'Jane' },
        ),
      ).resolves.toBeUndefined();

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('production mode', () => {
    beforeEach(async () => {
      service = await buildModule('production');
    });

    it('should call the UnoSend API with correct payload', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      await service.sendTemplate(
        'guest@example.com',
        EmailTemplate.MessageReceived,
        { recipientName: 'Jane', body: 'Hello' },
      );

      expect(fetchMock).toHaveBeenCalledWith(
        'https://app.unosend.co/api/v1/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            to: 'guest@example.com',
            template_id: EmailTemplate.MessageReceived,
            variables: { recipientName: 'Jane', body: 'Hello' },
          }),
        }),
      );
    });

    it('should throw when API returns a non-2xx response', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        text: jest.fn().mockResolvedValue('Invalid template'),
      });

      await expect(
        service.sendTemplate(
          'guest@example.com',
          EmailTemplate.BookingConfirmed,
          {},
        ),
      ).rejects.toThrow('UnoSend request failed: 422');
    });
  });
});
