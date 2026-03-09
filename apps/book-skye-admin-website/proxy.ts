import { NextResponse } from "next/server";
import { auth } from "./app/auth";

const protectedPaths = [
  "/forgot-password",
  "/login",
  "/reset-password",
  "/api/auth",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
