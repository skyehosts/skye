import { PageContainer } from '@repo/web-components/layout/page-container';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '../auth';
import MessagesClient from './MessagesClient';

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <Suspense>
        <MessagesClient />
      </Suspense>
    </PageContainer>
  );
}
