import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '../../auth';
import { ChangeEmailSubscriptionsWrapper } from './ChangeEmailSubscriptionsWrapper';

export default async function EmailSubscriptionsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main>
      <Suspense>
        <ChangeEmailSubscriptionsWrapper />
      </Suspense>
    </main>
  );
}
