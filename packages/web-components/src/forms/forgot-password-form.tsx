'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getDisplayError } from './get-display-error';

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormValues) => Promise<void>;
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
  });

  const handleFormSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await onSubmit(data);
      setSubmitted(true);
    } catch (e) {
      setServerError(getDisplayError(e));
    }
  };

  if (submitted) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          If an account with that email exists, we have sent a password reset
          link. Please check your inbox.
        </Alert>
        <Link href="/login">Back to log in</Link>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Stack spacing={3}>
        <TextField
          label="Email"
          type="email"
          fullWidth
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
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>

        <Link href="/login">Back to log in</Link>
      </Stack>
    </Box>
  );
}
