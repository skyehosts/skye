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

export interface DeleteAccountFormValues {
  confirmation: string;
}

export interface DeleteAccountFormProps {
  onSubmit: () => Promise<void>;
}

export function DeleteAccountForm({ onSubmit }: DeleteAccountFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountFormValues>({
    defaultValues: {
      confirmation: '',
    },
  });

  const handleFormSubmit = async () => {
    setServerError(null);
    try {
      await onSubmit();
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
        Delete your account
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={1}>
        If you wish to delete your account, please type the word
        &ldquo;delete&rdquo; into the field below to confirm.
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Once the deletion has completed you will then be logged out
        automatically.
      </Typography>

      <Stack spacing={3}>
        <TextField
          label='Type "delete" to confirm'
          fullWidth
          error={!!errors.confirmation}
          helperText={errors.confirmation?.message}
          {...register('confirmation', {
            required: 'This field is required',
            validate: (value) =>
              value.toLowerCase() === 'delete' ||
              'Please type "delete" to confirm',
          })}
        />

        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSubmitting ? 'Deleting...' : 'Delete account'}
        </Button>
      </Stack>
    </Box>
  );
}
