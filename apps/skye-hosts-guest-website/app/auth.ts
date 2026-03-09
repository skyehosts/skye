import { createAuth } from '@repo/web/config';
import '@repo/web/types';

export const { handlers, auth, signIn, signOut } = createAuth({
  role: 'guest',
  secret: process.env.NEXTAUTH_SECRET ?? '',
});
