import { Suspense } from 'react';
import { LoginFormWrapper } from './LoginFormWrapper';

export default function LoginPage() {
  return (
    <main>
      <h1>Log in</h1>
      <Suspense>
        <LoginFormWrapper />
      </Suspense>
    </main>
  );
}
