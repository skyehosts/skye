'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getDisplayError } from './get-display-error';

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormValues) => Promise<void>;
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleFormSubmit = async (data: ChangePasswordFormValues) => {
    setServerError(null);
    setSuccess(false);
    try {
      await onSubmit(data);
      setSuccess(true);
      reset();
    } catch (e) {
      setServerError(getDisplayError(e));
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ maxWidth: 480 }}
    >
      <Typography variant="h6" mb={1}>
        Change your password
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter your current password and choose a new one.
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Current password"
          type="password"
          fullWidth
          error={!!errors.currentPassword}
          helperText={errors.currentPassword?.message}
          {...register('currentPassword', {
            required: 'Current password is required',
          })}
        />

        <TextField
          label="New password"
          type="password"
          fullWidth
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('newPassword', {
            required: 'New password is required',
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
          error={!!errors.confirmNewPassword}
          helperText={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword', {
            required: 'Please confirm your new password',
            validate: (value) =>
              value === watch('newPassword') || 'Passwords do not match',
          })}
        />

        {serverError && <Alert severity="error">{serverError}</Alert>}
        {success && (
          <Alert severity="success">Password changed successfully.</Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSubmitting ? 'Changing...' : 'Change password'}
        </Button>
      </Stack>
    </Box>
  );
}
