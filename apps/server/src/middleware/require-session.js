/**
 * require-session middleware
 *
 * Validates the JWT from the Authorization header and attaches
 * session data (userId, activeShopId, role) to req.session.
 *
 * All protected routes MUST call this before require-role.
 */

const jwt = require("jsonwebtoken");
const { db } = require("../lib/prisma");

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function requireSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No session token provided." });
  }

  const token = authHeader.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, NEXTAUTH_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }

  // payload from NextAuth JWT callback contains: userId, activeShopId
  const userId = payload.userId || payload.sub;
  const activeShopId = payload.activeShopId;

  if (!userId || !activeShopId) {
    return res.status(401).json({ error: "Incomplete session payload." });
  }

  // Verify the user actually belongs to this shop (tenant isolation)
  const shopMember = await db.shopMember.findFirst({
    where: { userId, shopId: activeShopId },
    select: { role: true, shopId: true },
  });

  if (!shopMember) {
    return res.status(403).json({ error: "Access denied to this shop." });
  }

  // Attach to req for downstream use
  req.session = {
    userId,
    activeShopId,
    role: shopMember.role, // "OWNER" | "STAFF"
  };

  next();
}

module.exports = { requireSession };
