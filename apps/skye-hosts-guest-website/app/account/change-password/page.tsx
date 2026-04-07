import { PageContainer } from '@repo/web-components/layout/page-container';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '../../auth';
import { ChangePasswordFormWrapper } from './ChangePasswordFormWrapper';

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <h1>Change password</h1>
      <Suspense>
        <ChangePasswordFormWrapper />
      </Suspense>
    </PageContainer>
  );
}
