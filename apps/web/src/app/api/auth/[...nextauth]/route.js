import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@hisab-kitab/database";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { shopMembers: { include: { shop: true } } }
        });
        if (!user || !user.passwordHash) {
          throw new Error("No user found with this email.");
        }
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Incorrect password.");
        }
        const activeShop = user.shopMembers?.[0]?.shopId || null;
        return { id: user.id, name: user.name, email: user.email, activeShopId: activeShop };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) { token.userId = user.id; token.activeShopId = user.activeShopId; }
      if (trigger === "update" && session?.activeShopId) { token.activeShopId = session.activeShopId; }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) { session.user.id = token.userId; session.user.activeShopId = token.activeShopId; }
      return session;
    }
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };