'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';

export type LogInOrSignUpStep = 'email' | 'login' | 'signup';

export interface LogInOrSignUpEmailValues {
  email: string;
}

export interface LogInOrSignUpLoginValues {
  password: string;
}

export interface LogInOrSignUpSignUpValues {
  name: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface LogInOrSignUpModalProps {
  open: boolean;
  onClose: () => void;
  step: LogInOrSignUpStep;
  email: string;
  serverError: string | null;
  onEmailSubmit: (data: LogInOrSignUpEmailValues) => Promise<void>;
  onLoginSubmit: (data: LogInOrSignUpLoginValues) => Promise<void>;
  onSignUpSubmit: (data: LogInOrSignUpSignUpValues) => Promise<void>;
  logoSrc: string;
  logoAlt?: string;
}

function EmailStep({
  onSubmit,
}: {
  onSubmit: (data: LogInOrSignUpEmailValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LogInOrSignUpEmailValues>({ defaultValues: { email: '' } });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Continue
        </Button>
      </Stack>
    </Box>
  );
}

function LoginStep({
  email,
  onSubmit,
}: {
  email: string;
  onSubmit: (data: LogInOrSignUpLoginValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LogInOrSignUpLoginValues>({ defaultValues: { password: '' } });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Logging in as <strong>{email}</strong>
        </Typography>
        <TextField
          label="Password"
          type="password"
          fullWidth
          autoFocus
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Log in
        </Button>
        <Link href="/forgot-password" variant="body2" textAlign="center">
          Forgot password?
        </Link>
      </Stack>
    </Box>
  );
}

function SignUpStep({
  email,
  onSubmit,
}: {
  email: string;
  onSubmit: (data: LogInOrSignUpSignUpValues) => Promise<void>;
}) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LogInOrSignUpSignUpValues>({
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Creating account for <strong>{email}</strong>
        </Typography>
        <TextField
          label="Full name"
          fullWidth
          autoFocus
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            validate: (value) => {
              const hasUpper = /[A-Z]/.test(value);
              const hasLower = /[a-z]/.test(value);
              const hasNumber = /[0-9]/.test(value);
              if (!hasUpper || !hasLower || !hasNumber) {
                return 'Password must contain uppercase, lowercase, and a number';
              }
              return true;
            },
          })}
        />
        <TextField
          label="Confirm password"
          type="password"
          fullWidth
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === watch('password') || 'Passwords do not match',
          })}
        />
        <Controller
          name="acceptTerms"
          control={control}
          rules={{
            validate: (v) =>
              v === true ||
              'You must accept the Terms & Conditions and Privacy Policy',
          }}
          render={({ field }) => (
            <FormControl error={!!errors.acceptTerms}>
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label={
                  <Typography variant="body2">
                    I accept the{' '}
                    <Link
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />
              {errors.acceptTerms && (
                <FormHelperText>{errors.acceptTerms.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Sign up
        </Button>
      </Stack>
    </Box>
  );
}

function SocialButtons() {
  const sharedSx = {
    width: 50,
    height: 50,
    border: '1px solid',
    borderColor: 'custom.warmStone',
    borderRadius: 1,
  };
  return (
    <Stack direction="row" spacing={2} justifyContent="center">
      <IconButton sx={sharedSx} aria-label="Continue with Google" disabled>
        <Box
          component="span"
          sx={{ fontWeight: 700, fontSize: '1.125rem' }}
          aria-hidden
        >
          G
        </Box>
      </IconButton>
      <IconButton sx={sharedSx} aria-label="Continue with Facebook" disabled>
        <Box
          component="span"
          sx={{ fontWeight: 700, fontSize: '1.125rem' }}
          aria-hidden
        >
          f
        </Box>
      </IconButton>
    </Stack>
  );
}

export function LogInOrSignUpModal({
  open,
  onClose,
  step,
  email,
  serverError,
  onEmailSubmit,
  onLoginSubmit,
  onSignUpSubmit,
  logoSrc,
  logoAlt = 'Skye',
}: LogInOrSignUpModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
        <Stack spacing={3}>
          <Box textAlign="center">
            <Box sx={{ display: 'inline-block', mb: 1 }}>
              <Image src={logoSrc} alt={logoAlt} width={48} height={48} />
            </Box>
            <Typography
              component="h2"
              sx={{ fontSize: '26px', fontWeight: 600 }}
            >
              Log in or sign up
            </Typography>
          </Box>

          {serverError && <Alert severity="error">{serverError}</Alert>}

          {step === 'email' && <EmailStep onSubmit={onEmailSubmit} />}
          {step === 'login' && (
            <LoginStep email={email} onSubmit={onLoginSubmit} />
          )}
          {step === 'signup' && (
            <SignUpStep email={email} onSubmit={onSignUpSubmit} />
          )}

          {step === 'email' && (
            <>
              <Divider>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>
              <SocialButtons />
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
