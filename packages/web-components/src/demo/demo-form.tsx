'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { applyServerErrors } from '../forms/apply-server-errors';
import { getDisplayError } from '../forms/get-display-error';

export interface DemoFormValues {
  name: string;
  email: string;
  message: string;
  category: 'general' | 'support' | 'feedback';
  subscribe: boolean;
  age: number;
  priority: 'low' | 'medium' | 'high';
  website?: string;
}

export interface DemoFormResult {
  id: string;
  submittedAt: string;
}

export interface DemoFormProps {
  onSubmit: (data: DemoFormValues) => Promise<DemoFormResult>;
}

export function DemoForm({ onSubmit }: DemoFormProps) {
  const [result, setResult] = useState<DemoFormResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormValues>({
    defaultValues: {
      name: '',
      email: '',
      message: '',
      category: 'general',
      subscribe: false,
      age: 18,
      priority: 'medium',
      website: '',
    },
  });

  const handleFormSubmit = async (data: DemoFormValues) => {
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
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ maxWidth: 480 }}
    >
      <Typography variant="h6" mb={3}>
        Demo Form
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Name"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('name', {
            required: 'Name is required',
            maxLength: { value: 100, message: 'Max 100 characters' },
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

        <FormControl fullWidth error={!!errors.category}>
          <InputLabel id="category-label">Category</InputLabel>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Please select a category' }}
            render={({ field }) => (
              <Select labelId="category-label" label="Category" {...field}>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="feedback">Feedback</MenuItem>
              </Select>
            )}
          />
          {errors.category && (
            <FormHelperText sx={{ whiteSpace: 'pre-line' }}>
              {errors.category.message}
            </FormHelperText>
          )}
        </FormControl>

        <TextField
          label="Message"
          multiline
          rows={4}
          fullWidth
          error={!!errors.message}
          helperText={errors.message?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('message', {
            required: 'Message is required',
            maxLength: { value: 1000, message: 'Max 1000 characters' },
          })}
        />

        <TextField
          label="Age"
          type="number"
          fullWidth
          error={!!errors.age}
          helperText={errors.age?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('age', {
            required: 'Age is required',
            valueAsNumber: true,
            min: { value: 18, message: 'Must be at least 18' },
            max: { value: 120, message: 'Must be at most 120' },
          })}
        />

        <FormControl fullWidth error={!!errors.priority}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Controller
            name="priority"
            control={control}
            rules={{ required: 'Please select a priority' }}
            render={({ field }) => (
              <Select labelId="priority-label" label="Priority" {...field}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            )}
          />
          {errors.priority && (
            <FormHelperText sx={{ whiteSpace: 'pre-line' }}>
              {errors.priority.message}
            </FormHelperText>
          )}
        </FormControl>

        <TextField
          label="Website (optional)"
          type="url"
          fullWidth
          error={!!errors.website}
          helperText={errors.website?.message}
          slotProps={{ formHelperText: { sx: { whiteSpace: 'pre-line' } } }}
          {...register('website')}
        />

        <FormControlLabel
          control={<Checkbox {...register('subscribe')} />}
          label="Subscribe to updates"
        />

        {serverError && <Alert severity="error">{serverError}</Alert>}
        {result && (
          <Alert severity="success">
            Submitted successfully — ID: {result.id}
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
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </Stack>
    </Box>
  );
}
