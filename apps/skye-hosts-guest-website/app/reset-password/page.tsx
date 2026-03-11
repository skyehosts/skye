import { FormCard } from '@repo/web-components/layout/form-card';
import { Suspense } from 'react';
import { ResetPasswordFormWrapper } from './ResetPasswordFormWrapper';

export default function ResetPasswordPage() {
  return (
    <FormCard title="Reset password">
      <Suspense>
        <ResetPasswordFormWrapper />
      </Suspense>
    </FormCard>
  );
}
