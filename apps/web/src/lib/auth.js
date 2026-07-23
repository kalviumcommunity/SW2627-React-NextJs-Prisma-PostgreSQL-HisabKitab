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
        shopId: { label: "Shop ID", type: "text" }, // Optional
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
            throw new Error("Invalid email or password.");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          if (!isValid) {
            throw new Error("Invalid email or password.");
          }

          const isGlobalOwner = user.shopMembers.some(sm => sm.role === "OWNER");
          const isGlobalWorker = user.shopMembers.some(sm => sm.role === "STAFF");

          // Enforce role separation
          if (credentials.shopId && isGlobalOwner) {
            throw new Error("This email is registered as an Owner. Please log in as an Owner.");
          }
          if (!credentials.shopId && isGlobalWorker && !isGlobalOwner) {
            throw new Error("This email is registered as a Worker. Please log in as a Worker.");
          }

          let activeShop = user.shopMembers?.[0]?.shopId || null;
          let shopStatus = user.shopMembers?.[0]?.status || null;
          let shopRole = user.shopMembers?.[0]?.role || null;
          let shopPermissions = user.shopMembers?.[0]?.permissions || null;

          // If a shopId is provided during login (Worker join flow)
          if (credentials.shopId) {
            const requestedShopId = credentials.shopId.trim();
            const existingMembership = user.shopMembers.find(
              (sm) => sm.shopId === requestedShopId
            );

            if (!existingMembership) {
              // Verify shop exists
              const shopExists = await db.shop.findUnique({
                where: { id: requestedShopId },
              });
              if (!shopExists) {
                throw new Error("The provided Shop ID does not exist.");
              }
              // Create pending join request
              await db.shopMember.create({
                data: {
                  userId: user.id,
                  shopId: requestedShopId,
                  role: "STAFF",
                  status: "PENDING",
                },
              });
              shopStatus = "PENDING";
              shopRole = "STAFF";
              shopPermissions = null;
            } else {
              shopStatus = existingMembership.status;
              shopRole = existingMembership.role;
              shopPermissions = existingMembership.permissions;
            }
            activeShop = requestedShopId; 
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            activeShopId: activeShop,
            shopStatus: shopStatus,
            shopRole: shopRole,
            shopPermissions: shopPermissions,
          };
        } catch (error) {
          // Re-throw user-facing auth errors (our own throws above)
          if (error.message) throw new Error(error.message);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.activeShopId = user.activeShopId;
        token.shopStatus = user.shopStatus;
        token.shopRole = user.shopRole;
        token.shopPermissions = user.shopPermissions;
      }
      if (trigger === "update" && session?.activeShopId) {
        token.activeShopId = session.activeShopId;
        token.shopStatus = session.shopStatus;
        token.shopRole = session.shopRole;
        if (session.shopPermissions !== undefined) {
          token.shopPermissions = session.shopPermissions;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId;
        session.user.activeShopId = token.activeShopId;
        session.user.shopStatus = token.shopStatus;
        session.user.shopRole = token.shopRole;
        session.user.shopPermissions = token.shopPermissions;
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
