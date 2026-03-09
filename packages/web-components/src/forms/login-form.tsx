'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  infoMessage?: string;
}

export function LoginForm({ onSubmit, infoMessage }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFormSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await onSubmit(data);
    } catch (e) {
      setServerError(
        e instanceof Error
          ? e.message
          : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ maxWidth: 480 }}
    >
      <Typography variant="h6" mb={3}>
        Log in to your account
      </Typography>

      <Stack spacing={3}>
        {infoMessage && <Alert severity="info">{infoMessage}</Alert>}

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

        <TextField
          label="Password"
          type="password"
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
          })}
        />

        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">
            Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
          </Typography>
          <Link href="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}
