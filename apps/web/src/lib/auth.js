import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@hisab-kitab/database";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter both email and password.");
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
            include: { shopMembers: { include: { shop: true } } },
          });

          if (!user || !user.passwordHash) {
            // Generic message — don't reveal whether the email exists
            throw new Error("Invalid email or password.");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          if (!isValid) {
            // Same generic message for wrong password
            throw new Error("Invalid email or password.");
          }

          const activeShop = user.shopMembers?.[0]?.shopId || null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            activeShopId: activeShop,
          };
        } catch (error) {
          // Re-throw user-facing auth errors (our own throws above)
          if (error.message === "Invalid email or password." || 
              error.message === "Please enter both email and password.") {
            throw error;
          }
          // For any unexpected error (DB down, Prisma timeout, etc.),
          // log it server-side but show a safe message to the user
          console.error("[Auth] Login error:", error);
          throw new Error("Something went wrong. Please try again later.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.activeShopId = user.activeShopId;
      }
      if (trigger === "update" && session?.activeShopId) {
        token.activeShopId = session.activeShopId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId;
        session.user.activeShopId = token.activeShopId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
