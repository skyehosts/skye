import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AccountService } from '../account/providers';
import { ConfigService } from '../config/providers/config.service';
import { AuthService } from './providers/auth.service';
import { TwilioService } from './providers/twilio.service';

describe('AuthService', () => {
  let authService: AuthService;
  let accountService: Partial<Record<keyof AccountService, jest.Mock>>;

  beforeEach(async () => {
    accountService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByResetToken: jest.fn(),
      save: jest.fn(),
    };

    const configService = {
      getAll: jest.fn().mockReturnValue({
        jwtSecret: 'test-jwt-secret',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AccountService, useValue: accountService },
        { provide: ConfigService, useValue: configService },
        { provide: TwilioService, useValue: {} },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return user data on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('Password1', 10);
      accountService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'guest',
        passwordHash,
      });

      const result = await authService.login('test@example.com', 'Password1');

      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe('guest');
      expect(result.accessToken).toBeTruthy();
      expect(typeof result.accessToken).toBe('string');
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      accountService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('unknown@example.com', 'Password1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('Password1', 10);
      accountService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
      });

      await expect(
        authService.login('test@example.com', 'WrongPassword1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should store a reset token when email exists', async () => {
      const account = {
        id: 1,
        email: 'test@example.com',
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      };
      accountService.findByEmail.mockResolvedValue(account);
      accountService.save.mockResolvedValue(account);

      const result = await authService.forgotPassword('test@example.com');

      expect(result.message).toBeDefined();
      expect(accountService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordResetToken: expect.any(String),
          passwordResetTokenExpiry: expect.any(Date),
        }),
      );
      expect(account.passwordResetToken).toHaveLength(64);
      expect(account.passwordResetTokenExpiry.getTime()).toBeGreaterThan(
        Date.now(),
      );
    });

    it('should return same success message when email does not exist', async () => {
      accountService.findByEmail.mockResolvedValue(null);

      const result = await authService.forgotPassword('unknown@example.com');

      expect(result.message).toBeDefined();
      expect(accountService.save).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password and clear token on valid token', async () => {
      const futureExpiry = new Date();
      futureExpiry.setHours(futureExpiry.getHours() + 1);
      const account = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'old-hash',
        passwordResetToken: 'valid-token',
        passwordResetTokenExpiry: futureExpiry,
      };
      accountService.findByResetToken.mockResolvedValue(account);
      accountService.save.mockResolvedValue(account);

      const result = await authService.resetPassword(
        'valid-token',
        'NewPassword1',
      );

      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(account.passwordResetToken).toBeNull();
      expect(account.passwordResetTokenExpiry).toBeNull();
      expect(account.passwordHash).not.toBe('old-hash');
      expect(await bcrypt.compare('NewPassword1', account.passwordHash)).toBe(
        true,
      );
    });

    it('should throw BadRequestException for invalid token', async () => {
      accountService.findByResetToken.mockResolvedValue(null);

      await expect(
        authService.resetPassword('invalid-token', 'NewPassword1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      const pastExpiry = new Date();
      pastExpiry.setHours(pastExpiry.getHours() - 1);
      accountService.findByResetToken.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordResetToken: 'expired-token',
        passwordResetTokenExpiry: pastExpiry,
      });

      await expect(
        authService.resetPassword('expired-token', 'NewPassword1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkEmailExists', () => {
    it('should return true when an account exists for the email', async () => {
      accountService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'found@example.com',
      });

      const result = await authService.checkEmailExists('found@example.com');

      expect(result).toBe(true);
      expect(accountService.findByEmail).toHaveBeenCalledWith(
        'found@example.com',
      );
    });

    it('should return false when no account exists for the email', async () => {
      accountService.findByEmail.mockResolvedValue(null);

      const result = await authService.checkEmailExists('missing@example.com');

      expect(result).toBe(false);
      expect(accountService.findByEmail).toHaveBeenCalledWith(
        'missing@example.com',
      );
    });

    it('should always query the account service (constant DB work)', async () => {
      accountService.findByEmail.mockResolvedValue(null);

      await authService.checkEmailExists('a@example.com');
      await authService.checkEmailExists('a@example.com');
      await authService.checkEmailExists('b@example.com');

      expect(accountService.findByEmail).toHaveBeenCalledTimes(3);
    });
  });

  describe('changePassword', () => {
    it('should change password when current password is correct', async () => {
      const passwordHash = await bcrypt.hash('OldPassword1', 10);
      const account = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
      };
      accountService.findById.mockResolvedValue(account);
      accountService.save.mockResolvedValue(account);

      const result = await authService.changePassword(
        1,
        'OldPassword1',
        'NewPassword1',
      );

      expect(result.message).toBe('Password changed successfully');
      expect(await bcrypt.compare('NewPassword1', account.passwordHash)).toBe(
        true,
      );
      expect(accountService.save).toHaveBeenCalledWith(account);
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      const passwordHash = await bcrypt.hash('OldPassword1', 10);
      accountService.findById.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash,
      });

      await expect(
        authService.changePassword(1, 'WrongPassword1', 'NewPassword1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account not found', async () => {
      accountService.findById.mockResolvedValue(null);

      await expect(
        authService.changePassword(0, 'OldPassword1', 'NewPassword1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
