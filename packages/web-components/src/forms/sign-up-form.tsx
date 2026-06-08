'use client';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { applyServerErrors } from '../forms/apply-server-errors';
import { getDisplayError } from '../forms/get-display-error';

export interface SignUpFormValues {
  name: string;
  email: string;
  confirmEmail: string;
  password: string;
  acceptTerms: boolean;
}

export interface SignUpFormResult {}

export interface SignUpFormProps {
  onSubmit: (data: SignUpFormValues) => Promise<SignUpFormResult>;
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [result, setResult] = useState<SignUpFormResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    defaultValues: {
      name: '',
      email: '',
      confirmEmail: '',
      password: '',
      acceptTerms: false,
    },
  });

  const handleFormSubmit = async (data: SignUpFormValues) => {
    setServerError(null);
    setResult(null);
    try {
      const response = await onSubmit(data);
      setResult(response);
      reset();
    } catch (e) {
      if (applyServerErrors(e, setError)) return;
      setServerError(getDisplayError(e));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Stack spacing={3}>
        <TextField
          label="Full name"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('name', {
            required: 'Name is required',
          })}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />

        <TextField
          label="Confirm email"
          type="email"
          fullWidth
          error={!!errors.confirmEmail}
          helperText={errors.confirmEmail?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('confirmEmail', {
            required: 'Please confirm your email',
            validate: (value) =>
              value === watch('email') || 'Email addresses do not match',
          })}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            pattern: {
              value: /^\S{6,99}$/,
              message:
                'Must contain no spaces and be at least 6 characters long.',
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

        {serverError && <Alert severity="error">{serverError}</Alert>}
        {result && (
          <Alert severity="success">Account created successfully!</Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ alignSelf: 'flex-start' }}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSubmitting ? 'Signing up…' : 'Sign up'}
        </Button>
      </Stack>
    </Box>
  );
}
