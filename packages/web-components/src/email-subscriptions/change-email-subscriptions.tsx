'use client';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getDisplayError } from '../forms/get-display-error';

export interface ChangeEmailSubscriptionsValues {
  subscribedToNewsViaEmail: boolean;
}

export interface ChangeEmailSubscriptionsProps {
  onLoad: () => Promise<ChangeEmailSubscriptionsValues>;
  onSubmit: (data: ChangeEmailSubscriptionsValues) => Promise<void>;
}

export function ChangeEmailSubscriptions({
  onLoad,
  onSubmit,
}: ChangeEmailSubscriptionsProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ChangeEmailSubscriptionsValues>({
    defaultValues: {
      subscribedToNewsViaEmail: false,
    },
  });

  useEffect(() => {
    onLoad()
      .then((values) => {
        reset(values);
        setLoading(false);
      })
      .catch((e) => {
        setLoadError(
          e instanceof Error
            ? e.message
            : 'Failed to load email subscriptions.',
        );
        setLoading(false);
      });
  }, [onLoad, reset]);

  const handleFormSubmit = async (data: ChangeEmailSubscriptionsValues) => {
    setServerError(null);
    setSuccess(false);
    try {
      await onSubmit(data);
      setSuccess(true);
    } catch (e) {
      setServerError(getDisplayError(e));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ maxWidth: 480, display: 'flex', justifyContent: 'center', py: 4 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 480 }}>
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ maxWidth: 480 }}
    >
      <Typography variant="h6" mb={1}>
        Email subscriptions
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Choose which emails you would like to receive.
      </Typography>

      <Stack spacing={2}>
        <Controller
          name="subscribedToNewsViaEmail"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label="News and updates"
            />
          )}
        />

        {serverError && <Alert severity="error">{serverError}</Alert>}
        {success && (
          <Alert severity="success">
            Email subscriptions updated successfully.
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </Stack>
    </Box>
  );
}
