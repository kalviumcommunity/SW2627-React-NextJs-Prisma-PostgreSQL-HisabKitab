const { Router } = require("express");
const { db } = require("../../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  shopId: z.string().cuid().optional(),
});

// POST /api/auth/login  — returns a JWT for use with the API server
// (Separate from NextAuth — used when calling server/ directly)
router.post("/login", async (req, res) => {
  const { email, password, shopId } = loginSchema.parse(req.body);

  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { shopMembers: { include: { shop: true } } },
  });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password." });

  // Determine active shop
  const activeShopId = shopId || user.shopMembers[0]?.shopId;
  if (!activeShopId) return res.status(403).json({ error: "No shop found for this user." });

  const member = user.shopMembers.find((m) => m.shopId === activeShopId);
  if (!member) return res.status(403).json({ error: "Access denied to this shop." });

  const token = jwt.sign(
    { userId: user.id, activeShopId, role: member.role },
    process.env.NEXTAUTH_SECRET,
    { expiresIn: "30d" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
    shop: { id: member.shopId, name: member.shop.name, role: member.role },
  });
});

// GET /api/auth/me  — get current user info from token
router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "No token." });

  try {
    const payload = jwt.verify(auth.slice(7), process.env.NEXTAUTH_SECRET);
    res.json({ userId: payload.userId, activeShopId: payload.activeShopId, role: payload.role });
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
});

module.exports = router;
