import { NextResponse } from "next/server";
import { db } from "@hisab-kitab/database";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, shopName } = body;

    // ── Inline validation ──────────────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }
    if (
      !shopName ||
      typeof shopName !== "string" ||
      shopName.trim().length < 2
    ) {
      return NextResponse.json(
        { error: "Shop name must be at least 2 characters." },
        { status: 400 }
      );
    }

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