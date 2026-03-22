import { NextResponse } from 'next/server';
import { auth } from './app/auth';

const protectedPaths = ['/account', '/messages', '/bookings'];

export default auth((req) => {
  if (process.env.NEXT_PUBLIC_SKYE_ENVIRONMENT === 'production') {
    const user = process.env.BASIC_AUTH_USER;
    const pass = process.env.BASIC_AUTH_PASS;

    if (user && pass) {
      const authHeader = req.headers.get('authorization');
      const expected =
        'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

      if (authHeader !== expected) {
        return new NextResponse('Authentication required', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        });
      }
    }
  }

  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
