import { FormCard } from '@repo/web-components/layout/form-card';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { Suspense } from 'react';
import { ResetPasswordFormWrapper } from './ResetPasswordFormWrapper';

export default function ResetPasswordPage() {
  return (
    <PageContainer>
      <FormCard title="Reset password">
        <Suspense>
          <ResetPasswordFormWrapper />
        </Suspense>
      </FormCard>
    </PageContainer>
  );
}
