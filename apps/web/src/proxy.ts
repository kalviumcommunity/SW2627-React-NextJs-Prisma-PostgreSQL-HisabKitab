import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/contacts/:path*",
    "/workers/:path*",
    "/inventory/:path*",
    "/settings/:path*",
    "/notifications/:path*",
  ],
};
