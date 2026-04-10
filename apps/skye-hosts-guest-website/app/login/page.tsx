import { FormCard } from '@repo/web-components/layout/form-card';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { Suspense } from 'react';
import { LoginFormWrapper } from './LoginFormWrapper';

export default function LoginPage() {
  return (
    <PageContainer>
      <FormCard title="Log in">
        <Suspense>
          <LoginFormWrapper />
        </Suspense>
      </FormCard>
    </PageContainer>
  );
}
