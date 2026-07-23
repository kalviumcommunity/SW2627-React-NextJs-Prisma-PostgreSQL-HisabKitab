"use server";

import { db } from "@hisab-kitab/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getSessionContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.activeShopId) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function getWorkers() {
  try {
    const user = await getSessionContext();
    const workers = await db.worker.findMany({
      where: { 
        shopId: user.activeShopId,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Serialize Decimals and Dates for Client Components
    return workers.map(w => ({
      id: w.id,
      name: w.name,
      designation: w.designation,
      payType: w.payType,
      monthlySalary: w.monthlySalary ? w.monthlySalary.toString() : null,
      dailyWageRate: w.dailyWageRate ? w.dailyWageRate.toString() : null,
      joiningDate: w.joiningDate.toISOString(),
      active: w.active,
      // Default missing UI fields to 0 for mock purposes until attendance is built
      presentDays: 0,
      absentDays: 0,
      advancePaid: "0.00"
    }));
  } catch (error) {
    console.error("Failed to fetch workers:", error);
    return [];
  }
}

export async function createWorker(data) {
  try {
    const user = await getSessionContext();
    await db.worker.create({
      data: {
        shopId: user.activeShopId,
        name: data.name,
        designation: data.designation,
        payType: data.payType,
        monthlySalary: data.monthlySalary ? parseFloat(data.monthlySalary) : null,
        dailyWageRate: data.dailyWageRate ? parseFloat(data.dailyWageRate) : null,
        joiningDate: new Date(data.joiningDate),
        createdBy: user.id,
      }
    });
    revalidatePath("/workers");
    return { success: true };
  } catch (error) {
    console.error("Failed to create worker:", error);
    return { success: false, error: "Failed to create worker" };
  }
}

// --- New Actions for Worker App Logins (ShopMembers) ---

export async function getPendingApprovals() {
  try {
    const user = await getSessionContext();
    
    // Check if the current user is an OWNER
    const membership = await db.shopMember.findUnique({
      where: { userId_shopId: { userId: user.id, shopId: user.activeShopId } }
    });
    
    if (membership?.role !== "OWNER") {
      throw new Error("Only owners can view approvals.");
    }

    const pending = await db.shopMember.findMany({
      where: {
        shopId: user.activeShopId,
        status: "PENDING",
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { joinedAt: "asc" }
    });

    return pending.map(p => ({
      id: p.id,
      userId: p.userId,
      name: p.user.name,
      email: p.user.email,
      joinedAt: p.joinedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch pending approvals:", error);
    return [];
  }
}

export async function approveWorker(memberId) {
  try {
    const user = await getSessionContext();
    const membership = await db.shopMember.findUnique({
      where: { userId_shopId: { userId: user.id, shopId: user.activeShopId } }
    });
    
    if (membership?.role !== "OWNER") {
      throw new Error("Unauthorized");
    }

    // Verify the member belongs to the active shop
    const targetMember = await db.shopMember.findUnique({ where: { id: memberId } });
    if (!targetMember || targetMember.shopId !== user.activeShopId) {
      throw new Error("Invalid member");
    }

    await db.shopMember.update({
      where: { id: memberId },
      data: { status: "ACTIVE" }
    });
    
    revalidatePath("/settings/staff");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve worker:", error);
    return { success: false, error: "Failed to approve worker." };
  }
}

export async function rejectWorker(memberId) {
  try {
    const user = await getSessionContext();
    const membership = await db.shopMember.findUnique({
      where: { userId_shopId: { userId: user.id, shopId: user.activeShopId } }
    });
    
    if (membership?.role !== "OWNER") {
      throw new Error("Unauthorized");
    }

    const targetMember = await db.shopMember.findUnique({ where: { id: memberId } });
    if (!targetMember || targetMember.shopId !== user.activeShopId) {
      throw new Error("Invalid member");
    }

    await db.shopMember.update({
      where: { id: memberId },
      data: { status: "REJECTED" }
    });
    
    revalidatePath("/settings/staff");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject worker:", error);
    return { success: false, error: "Failed to reject worker." };
  }
}

export async function getActiveStaff() {
  try {
    const user = await getSessionContext();
    const membership = await db.shopMember.findUnique({
      where: { userId_shopId: { userId: user.id, shopId: user.activeShopId } }
    });
    
    if (membership?.role !== "OWNER") {
      throw new Error("Unauthorized");
    }

    const staff = await db.shopMember.findMany({
      where: {
        shopId: user.activeShopId,
        status: "ACTIVE",
        role: "STAFF"
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { joinedAt: "asc" }
    });

    return staff.map(s => ({
      id: s.id,
      userId: s.userId,
      name: s.user.name,
      email: s.user.email,
      permissions: s.permissions || {},
      joinedAt: s.joinedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch active staff:", error);
    return [];
  }
}

export async function updateWorkerPermissions(memberId, permissions) {
  try {
    const user = await getSessionContext();
    const membership = await db.shopMember.findUnique({
      where: { userId_shopId: { userId: user.id, shopId: user.activeShopId } }
    });
    
    if (membership?.role !== "OWNER") {
      throw new Error("Unauthorized");
    }

    const targetMember = await db.shopMember.findUnique({ where: { id: memberId } });
    if (!targetMember || targetMember.shopId !== user.activeShopId) {
      throw new Error("Invalid member");
    }

    await db.shopMember.update({
      where: { id: memberId },
      data: { permissions: permissions }
    });
    
    revalidatePath("/settings/staff");
    return { success: true };
  } catch (error) {
    console.error("Failed to update worker permissions:", error);
    return { success: false, error: "Failed to update permissions." };
  }
}
