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
