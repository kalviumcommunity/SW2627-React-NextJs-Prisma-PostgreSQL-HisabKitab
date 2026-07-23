import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPendingApprovalPage = pathname === '/pending-approval';
  
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;

  if (isAuthPage) {
    if (isAuth) {
      if (token.shopStatus === 'PENDING') {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const shopStatus = token?.shopStatus;

  if (shopStatus === 'PENDING' && !isPendingApprovalPage) {
    return NextResponse.redirect(new URL('/pending-approval', request.url));
  }

  if (shopStatus === 'ACTIVE' && isPendingApprovalPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ledger/:path*",
    "/analytics/:path*",
    "/workers/:path*",
    "/inventory/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/pending-approval",
    "/login",
    "/register"
  ],
};
