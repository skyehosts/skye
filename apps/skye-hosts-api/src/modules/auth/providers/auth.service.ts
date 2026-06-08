import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  IAccountPhoneRequestOtpResponseDto,
  IAccountPhoneVerifyOtpResponseDto,
  IChangePasswordResponseDto,
  IEmailRequestOtpResponseDto,
  IEmailVerifyOtpResponseDto,
  IForgotPasswordResponseDto,
  ILoginResponseDto,
  IPhoneRequestOtpResponseDto,
  IPhoneVerifyOtpResponseDto,
  IRefreshTokenResponseDto,
  IResetPasswordResponseDto,
} from '@repo/skye-hosts-api-client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Account } from '../../account/entities';
import { AccountService } from '../../account/providers';
import { ConfigService } from '../../config/providers/config.service';
import { SignUpRequestDto } from '../dto';
import { TwilioService } from './twilio.service';

function fieldError(property: string, message: string) {
  return new BadRequestException([
    { property, constraints: { custom: message } },
  ]);
}

const FORGOT_PASSWORD_MESSAGE =
  'If an account with that email exists, we have sent a password reset link.';

const RESET_TOKEN_EXPIRY_HOURS = 1;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;

  constructor(
    private accountService: AccountService,
    private configService: ConfigService,
    private twilioService: TwilioService,
  ) {
    this.jwtSecret = this.configService.getAll().jwtSecret;
  }

  private async generateTokenPair(account: Account): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { jwtSecret } = this;

    const accessToken = jwt.sign(
      {
        sub: account.id,
        email: account.email,
        phoneNumber: account.phoneNumber,
        name: account.name,
        role: account.role,
      },
      jwtSecret,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const jti = randomBytes(32).toString('hex');
    const refreshToken = jwt.sign(
      {
        sub: account.id,
        jti,
      },
      jwtSecret,
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    account.refreshTokenHash = await bcrypt.hash(jti, 10);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    account.refreshTokenExpiry = expiry;
    await this.accountService.save(account);

    return { accessToken, refreshToken };
  }

  private revokeRefreshToken(account: Account): void {
    account.refreshTokenHash = null;
    account.refreshTokenExpiry = null;
  }

  async refresh(refreshTokenRaw: string): Promise<IRefreshTokenResponseDto> {
    const { jwtSecret } = this;

    let decoded: { sub: number; jti: string };
    try {
      decoded = jwt.verify(refreshTokenRaw, jwtSecret) as unknown as {
        sub: number;
        jti: string;
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const account = await this.accountService.findById(decoded.sub);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    if (
      !account.refreshTokenHash ||
      !account.refreshTokenExpiry ||
      account.refreshTokenExpiry < new Date()
    ) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    const jtiValid = await bcrypt.compare(
      decoded.jti,
      account.refreshTokenHash,
    );
    if (!jtiValid) {
      this.revokeRefreshToken(account);
      await this.accountService.save(account);
      throw new UnauthorizedException(
        'Refresh token reuse detected, all sessions revoked',
      );
    }

    const tokens = await this.generateTokenPair(account);

    return {
      ...tokens,
      user: {
        id: account.id,
        name: account.name,
        phoneNumber: account.phoneNumber,
        role: account.role,
      },
    };
  }

  async logout(userId: number): Promise<void> {
    const account = await this.accountService.findById(userId);
    if (account) {
      this.revokeRefreshToken(account);
      await this.accountService.save(account);
    }
  }

  async forgotPassword(email: string): Promise<IForgotPasswordResponseDto> {
    const account = await this.accountService.findByEmail(email);

    if (account) {
      const token = randomBytes(32).toString('hex');
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + RESET_TOKEN_EXPIRY_HOURS);

      account.passwordResetToken = token;
      account.passwordResetTokenExpiry = expiry;
      await this.accountService.save(account);

      // TODO: Send email with reset link containing token
    }

    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<IResetPasswordResponseDto> {
    const account = await this.accountService.findByResetToken(token);
    if (!account) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (
      !account.passwordResetTokenExpiry ||
      account.passwordResetTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    account.passwordHash = await bcrypt.hash(password, 10);
    account.passwordResetToken = null;
    account.passwordResetTokenExpiry = null;
    await this.accountService.save(account);

    return {
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
      },
    };
  }

  async login(email: string, password: string): Promise<ILoginResponseDto> {
    const account = await this.accountService.findByEmail(email);
    if (!account) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      account.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokenPair(account);

    return {
      ...tokens,
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
      },
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<IChangePasswordResponseDto> {
    const account = await this.accountService.findById(userId);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      account.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    account.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.accountService.save(account);

    return { message: 'Password changed successfully' };
  }

  async phoneRequestOtp(
    phoneNumber: string,
  ): Promise<IPhoneRequestOtpResponseDto> {
    await this.twilioService.sendVerification(phoneNumber);
    return { message: 'Verification code sent' };
  }

  async phoneLookup(phoneNumber: string): Promise<boolean> {
    const account = await this.accountService.findByPhoneNumber(phoneNumber);
    this.logger.debug(`phoneLookup "${phoneNumber}" → ${!!account}`);
    return !!account;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const account = await this.accountService.findByEmail(email);
    this.logger.debug(`checkEmailExists "${email}" → ${!!account}`);
    return !!account;
  }

  async phoneVerifyOtp(
    phoneNumber: string,
    code: string,
    name?: string,
    email?: string,
  ): Promise<IPhoneVerifyOtpResponseDto> {
    const isValid = await this.twilioService.checkVerification(
      phoneNumber,
      code,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    let account = await this.accountService.findByPhoneNumber(phoneNumber);
    this.logger.debug(
      `phoneVerifyOtp "${phoneNumber}" → ${account ? `existing id=${account.id}` : 'new account'}`,
    );
    if (!account) {
      if (!name) {
        throw new BadRequestException('Name is required for new accounts');
      }
      account = await this.accountService.createFromPhone(
        phoneNumber,
        name,
        email,
      );
    } else if (email && !account.email) {
      account.email = email;
    }

    account.lastLoggedIn = new Date();
    await this.accountService.save(account);

    const tokens = await this.generateTokenPair(account);

    return {
      ...tokens,
      user: {
        id: account.id,
        name: account.name,
        phoneNumber: phoneNumber,
        role: account.role,
      },
      ...(account.pinHash && account.pinSalt
        ? { pin: { hash: account.pinHash, salt: account.pinSalt } }
        : {}),
    };
  }

  async emailRequestOtp(
    userId: number,
    email: string,
  ): Promise<IEmailRequestOtpResponseDto> {
    const existing = await this.accountService.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw fieldError('email', 'Email address is already in use');
    }

    await this.twilioService.sendVerificationToEmail(email);
    return { message: 'Verification code sent' };
  }

  async emailVerifyOtp(
    userId: number,
    email: string,
    code: string,
  ): Promise<IEmailVerifyOtpResponseDto> {
    const existing = await this.accountService.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw fieldError('email', 'Email address is already in use');
    }

    const isValid = await this.twilioService.checkVerificationForEmail(
      email,
      code,
    );
    if (!isValid) {
      throw fieldError('code', 'Invalid or expired verification code');
    }

    const account = await this.accountService.findById(userId);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    account.email = email;
    await this.accountService.save(account);

    return { success: true };
  }

  async setupPin(
    userId: number,
    pinHash: string,
    pinSalt: string,
  ): Promise<void> {
    const account = await this.accountService.findById(userId);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }
    account.pinHash = pinHash;
    account.pinSalt = pinSalt;
    await this.accountService.save(account);
  }

  async phoneChangeRequestOtp(
    userId: number,
    phoneNumber: string,
  ): Promise<IAccountPhoneRequestOtpResponseDto> {
    const existing = await this.accountService.findByPhoneNumber(phoneNumber);
    if (existing && existing.id !== userId) {
      throw fieldError('phoneNumber', 'Phone number is already in use');
    }

    await this.twilioService.sendVerification(phoneNumber);
    return { message: 'Verification code sent' };
  }

  async phoneChangeVerifyOtp(
    userId: number,
    phoneNumber: string,
    code: string,
  ): Promise<IAccountPhoneVerifyOtpResponseDto> {
    const existing = await this.accountService.findByPhoneNumber(phoneNumber);
    if (existing && existing.id !== userId) {
      throw fieldError('phoneNumber', 'Phone number is already in use');
    }

    const isValid = await this.twilioService.checkVerification(
      phoneNumber,
      code,
    );
    if (!isValid) {
      throw fieldError('code', 'Invalid or expired verification code');
    }

    const account = await this.accountService.findById(userId);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    account.phoneNumber = phoneNumber;
    await this.accountService.save(account);

    return { phoneNumber };
  }

  async signUp(dto: SignUpRequestDto): Promise<Account> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.accountService.create(
      dto.email,
      dto.name,
      passwordHash,
      dto.role,
      dto.subscribedToNewsViaEmail,
    );
  }
}
