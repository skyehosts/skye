'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getDisplayError } from './get-display-error';

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormValues) => Promise<void>;
  tokenMissing?: boolean;
}

export function ResetPasswordForm({
  onSubmit,
  tokenMissing,
}: ResetPasswordFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await onSubmit(data);
    } catch (e) {
      setServerError(getDisplayError(e));
    }
  };

  if (tokenMissing) {
    return (
      <Alert severity="error">
        Invalid or missing reset token. Please request a new password reset
        link.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Stack spacing={3}>
        <TextField
          label="New password"
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

        <TextField
          label="Confirm new password"
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

        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ alignSelf: 'flex-start' }}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </Button>
      </Stack>
    </Box>
  );
}
