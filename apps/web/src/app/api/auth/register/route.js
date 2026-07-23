import { NextResponse } from "next/server";
import { db } from "@hisab-kitab/database";
import { registerSchema } from "@hisab-kitab/shared";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();

    // ── Validate with shared Zod schema ──────────────────────────
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password, role, shopName, shopId } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();

    // ── Check existing user ────────────────────────────────────
    const existingUser = await db.user.findUnique({
      where: { email: lowerEmail },
      include: { shopMembers: true }
    });
    
    if (existingUser) {
      const isOwner = existingUser.shopMembers.some(sm => sm.role === "OWNER");
      const isWorker = existingUser.shopMembers.some(sm => sm.role === "STAFF");
      
      let errorMsg = "A user with this email already exists.";
      if (isOwner) {
        errorMsg = "This email is already registered as an Owner.";
      } else if (isWorker) {
        errorMsg = "This email is already registered as a Worker.";
      }
      
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    // If worker, verify shop exists before doing anything
    if (role === 'WORKER') {
      const targetShop = await db.shop.findUnique({ where: { id: shopId.trim() } });
      if (!targetShop) {
        return NextResponse.json({ error: "Shop ID not found." }, { status: 400 });
      }
    }

    // ── Hash password ──────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 10);

    // ── Create user + shop + membership in a single transaction ─
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: lowerEmail,
          passwordHash,
          preferredLanguage: "en",
        },
      });

      if (role === 'OWNER') {
        const shop = await tx.shop.create({
          data: {
            name: shopName.trim(),
            defaultLanguage: "en",
            halfDayFraction: 0.5,
            expiryAlertDays: 3,
            staffCanEditTransactions: true,
            staffCanDeleteTransactions: false,
            staffCanViewFinancials: true,
            staffCanRestoreTrash: false,
            createdBy: user.id,
          },
        });

        await tx.shopMember.create({
          data: {
            userId: user.id,
            shopId: shop.id,
            role: "OWNER",
            status: "ACTIVE",
          },
        });
        return { user, shop };
      } else {
        // WORKER role
        await tx.shopMember.create({
          data: {
            userId: user.id,
            shopId: shopId.trim(),
            role: "STAFF",
            status: "PENDING",
          },
        });
        return { user, shop: { id: shopId.trim() } };
      }
    });

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      shopId: result.shop.id,
      message: "Registration successful.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}