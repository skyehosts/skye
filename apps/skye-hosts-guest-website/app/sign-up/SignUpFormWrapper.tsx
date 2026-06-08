'use client';

import {
  SignUpForm,
  SignUpFormResult,
  SignUpFormValues,
} from '@repo/web-components/forms/sign-up-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ISignUpRequestDto,
  fetchApi,
} from '../../../../packages/skye-hosts-api-client/src';

export function SignUpFormWrapper() {
  const router = useRouter();

  const handleSubmit = async (
    data: SignUpFormValues,
  ): Promise<SignUpFormResult> => {
    await fetchApi<SignUpFormResult, ISignUpRequestDto>('/auth/sign-up', {
      email: data.email,
      name: data.name,
      password: data.password,
      role: 'guest',
      subscribedToNewsViaEmail: false,
    });

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/');
    } else {
      router.push('/login?registered=true');
    }

    return {};
  };

  return <SignUpForm onSubmit={handleSubmit} />;
}
