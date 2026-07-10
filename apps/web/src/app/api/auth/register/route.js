import { NextResponse } from "next/server";
import { db } from "@hisab-kitab/database";
import { registerSchema } from "@hisab-kitab/shared";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password, shopName } = validation.data;
    const lowerEmail = email.toLowerCase();

    const existingUser = await db.user.findUnique({ where: { email: lowerEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email: lowerEmail, passwordHash, preferredLanguage: "en" }
      });
      const shop = await tx.shop.create({
        data: {
          name: shopName,
          defaultLanguage: "en",
          halfDayFraction: 0.5,
          expiryAlertDays: 3,
          staffCanEditTransactions: true,
          staffCanDeleteTransactions: false,
          staffCanViewFinancials: true,
          staffCanRestoreTrash: false
        }
      });
      await tx.shopMember.create({
        data: { userId: user.id, shopId: shop.id, role: "OWNER" }
      });
      return { user, shop };
    });

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      shopId: result.shop.id,
      message: "Registration successful."
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}