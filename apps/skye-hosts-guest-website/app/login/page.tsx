import { FormCard } from '@repo/web-components/layout/form-card';
import { Suspense } from 'react';
import { LoginFormWrapper } from './LoginFormWrapper';

export default function LoginPage() {
  return (
    <FormCard title="Log in">
      <Suspense>
        <LoginFormWrapper />
      </Suspense>
    </FormCard>
  );
}
