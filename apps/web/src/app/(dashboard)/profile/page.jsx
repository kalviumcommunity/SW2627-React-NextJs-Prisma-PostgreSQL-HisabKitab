import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@hisab-kitab/database";
import { redirect } from "next/navigation";
import ProfileView from "./ProfileView";

export const metadata = {
  title: "Profile | Hisab Kitab",
  description: "View and update your profile and shop details.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch full user details
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  // Fetch shop details via ShopMember
  const shopMember = await db.shopMember.findFirst({
    where: { userId: session.user.id },
    include: { shop: true },
  });

  if (!shopMember) {
    // If no shop exists, this is an edge case but we handle it gracefully
    return (
      <div className="p-8 text-center text-gray-500">
        No shop associated with your account.
      </div>
    );
  }

  const shop = shopMember.shop;

  // Aggregate monthly report stats (current month)
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Total Transactions this month
  const transactionsThisMonth = await db.transaction.count({
    where: {
      shopId: shop.id,
      createdAt: {
        gte: firstDayOfMonth,
      },
      isDeleted: false,
    },
  });

  // 2. Total active workers
  const activeWorkers = await db.worker.count({
    where: {
      shopId: shop.id,
      active: true,
      isDeleted: false,
    },
  });

  // 3. Earnings Rollups for this month
  const rollupsThisMonth = await db.earningsRollup.findMany({
    where: {
      shopId: shop.id,
      date: {
        gte: firstDayOfMonth,
      },
    },
  });

  const totalEarnedThisMonth = rollupsThisMonth.reduce((sum, r) => sum + Number(r.totalEarned || 0), 0);
  const totalLossThisMonth = rollupsThisMonth.reduce((sum, r) => sum + Number(r.totalLoss || 0), 0);

  const stats = {
    transactionsThisMonth,
    activeWorkers,
    totalEarnedThisMonth,
    totalLossThisMonth,
  };

  // Serialize objects to avoid "Decimal objects are not supported" errors in Next.js Server->Client boundary
  const serializedUser = JSON.parse(JSON.stringify(user));
  const serializedShop = JSON.parse(JSON.stringify(shop));

  return <ProfileView user={serializedUser} shop={serializedShop} stats={stats} />;
}
