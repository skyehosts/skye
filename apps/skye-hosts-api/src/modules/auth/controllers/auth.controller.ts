import { Body, Controller, Post } from '@nestjs/common';
import type {
  IAccountPhoneRequestOtpResponseDto,
  IAccountPhoneVerifyOtpResponseDto,
  IChangePasswordResponseDto,
  ICheckEmailResponseDto,
  IEmailRequestOtpResponseDto,
  IEmailVerifyOtpResponseDto,
  IForgotPasswordResponseDto,
  ILoginResponseDto,
  IPhoneLookupResponseDto,
  IPhoneRequestOtpResponseDto,
  IPhoneVerifyOtpResponseDto,
  IPinSetupResponseDto,
  IRefreshTokenResponseDto,
  IResetPasswordResponseDto,
} from '@repo/skye-hosts-api-client';
import {
  AuthenticatedUser,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  ChangePasswordRequestDto,
  CheckEmailRequestDto,
  EmailRequestOtpRequestDto,
  EmailVerifyOtpRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  PhoneChangeRequestOtpRequestDto,
  PhoneChangeVerifyOtpRequestDto,
  PhoneLookupRequestDto,
  PhoneRequestOtpRequestDto,
  PhoneVerifyOtpRequestDto,
  PinSetupRequestDto,
  RefreshTokenRequestDto,
  ResetPasswordRequestDto,
  SignUpRequestDto,
} from '../dto';
import { AuthService } from '../providers';
import { formatUkPhoneNumber } from '../utils/format-uk-phone-number';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('email-request-otp')
  async onEmailRequestOtp(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() dto: EmailRequestOtpRequestDto,
  ): Promise<IEmailRequestOtpResponseDto> {
    return this.authService.emailRequestOtp(authenticatedUser.sub, dto.email);
  }

  @Post('email-verify-otp')
  async onEmailVerifyOtp(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() dto: EmailVerifyOtpRequestDto,
  ): Promise<IEmailVerifyOtpResponseDto> {
    return this.authService.emailVerifyOtp(
      authenticatedUser.sub,
      dto.email,
      dto.code,
    );
  }

  @Post('check-email')
  @IgnoreBearerAuthentication()
  async onCheckEmail(
    @Body() dto: CheckEmailRequestDto,
  ): Promise<ICheckEmailResponseDto> {
    const exists = await this.authService.checkEmailExists(dto.email);
    return { exists };
  }

  @Post('change-password')
  async onChangePassword(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<IChangePasswordResponseDto> {
    return this.authService.changePassword(
      authenticatedUser.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('forgot-password')
  @IgnoreBearerAuthentication()
  async onForgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<IForgotPasswordResponseDto> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('login')
  @IgnoreBearerAuthentication()
  async onLogin(@Body() dto: LoginRequestDto): Promise<ILoginResponseDto> {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('logout')
  async onLogout(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.authService.logout(authenticatedUser.sub);
  }

  @Post('phone-lookup')
  @IgnoreBearerAuthentication()
  async onPhoneLookup(
    @Body() dto: PhoneLookupRequestDto,
  ): Promise<IPhoneLookupResponseDto> {
    const phoneNumber = formatUkPhoneNumber(dto.phoneNumber);
    const exists = await this.authService.phoneLookup(phoneNumber);
    return { exists };
  }

  @Post('phone-request-otp')
  @IgnoreBearerAuthentication()
  async onPhoneRequestOtp(
    @Body() dto: PhoneRequestOtpRequestDto,
  ): Promise<IPhoneRequestOtpResponseDto> {
    const phoneNumber = formatUkPhoneNumber(dto.phoneNumber);
    return this.authService.phoneRequestOtp(phoneNumber);
  }

  @Post('phone-verify-otp')
  @IgnoreBearerAuthentication()
  async onPhoneVerifyOtp(
    @Body() dto: PhoneVerifyOtpRequestDto,
  ): Promise<IPhoneVerifyOtpResponseDto> {
    const phoneNumber = formatUkPhoneNumber(dto.phoneNumber);
    return this.authService.phoneVerifyOtp(
      phoneNumber,
      dto.code,
      dto.name,
      dto.email,
    );
  }

  @Post('phone-change-request-otp')
  async onPhoneChangeRequestOtp(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() dto: PhoneChangeRequestOtpRequestDto,
  ): Promise<IAccountPhoneRequestOtpResponseDto> {
    const phoneNumber = formatUkPhoneNumber(dto.phoneNumber);
    return this.authService.phoneChangeRequestOtp(
      authenticatedUser.sub,
      phoneNumber,
    );
  }

  @Post('phone-change-verify-otp')
  async onPhoneChangeVerifyOtp(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() dto: PhoneChangeVerifyOtpRequestDto,
  ): Promise<IAccountPhoneVerifyOtpResponseDto> {
    const phoneNumber = formatUkPhoneNumber(dto.phoneNumber);
    return this.authService.phoneChangeVerifyOtp(
      authenticatedUser.sub,
      phoneNumber,
      dto.code,
    );
  }

  @Post('pin-setup')
  async onPinSetup(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() dto: PinSetupRequestDto,
  ): Promise<IPinSetupResponseDto> {
    await this.authService.setupPin(
      authenticatedUser.sub,
      dto.pinHash,
      dto.pinSalt,
    );
    return { message: 'PIN set up successfully' };
  }

  @Post('refresh')
  @IgnoreBearerAuthentication()
  async onRefresh(
    @Body() dto: RefreshTokenRequestDto,
  ): Promise<IRefreshTokenResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('reset-password')
  @IgnoreBearerAuthentication()
  async onResetPassword(
    @Body() dto: ResetPasswordRequestDto,
  ): Promise<IResetPasswordResponseDto> {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post('sign-up')
  @IgnoreBearerAuthentication()
  async onSignUp(@Body() dto: SignUpRequestDto): Promise<void> {
    await this.authService.signUp(dto);
  }
}
