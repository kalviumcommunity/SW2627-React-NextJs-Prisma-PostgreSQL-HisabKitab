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

    const { name, email, password, shopName } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();

    // ── Check existing user ────────────────────────────────────
    const existingUser = await db.user.findUnique({
      where: { email: lowerEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
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
        },
      });

      await tx.shopMember.create({
        data: {
          userId: user.id,
          shopId: shop.id,
          role: "OWNER",
        },
      });

      return { user, shop };
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