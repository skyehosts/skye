import { PageContainer } from '@repo/web-components/layout/page-container';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '../../auth';
import { DeleteAccountFormWrapper } from './DeleteAccountFormWrapper';

export default async function DeleteAccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <h1>Delete account</h1>
      <Suspense>
        <DeleteAccountFormWrapper />
      </Suspense>
    </PageContainer>
  );
}
