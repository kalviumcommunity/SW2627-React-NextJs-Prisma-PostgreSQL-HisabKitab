/**
 * require-role middleware
 *
 * Single source of truth for all role-based access control.
 * MUST be called after requireSession (which populates req.session.role).
 *
 * Usage:
 *   router.delete("/:id", requireSession, requireRole("OWNER"), handler);
 *   router.post("/",      requireSession, requireRole("STAFF"),  handler); // STAFF or OWNER
 *
 * Configurable permissions (edit/delete transactions, view financials, trash/restore)
 * are checked in the service layer against Shop settings — this middleware only
 * handles hard-coded role gates (OWNER-only actions).
 */

/**
 * @param {"OWNER" | "STAFF"} minimumRole
 *   "OWNER" → only Owners may proceed
 *   "STAFF" → both Staff and Owners may proceed
 */
function requireRole(minimumRole) {
  return (req, res, next) => {
    if (!req.session) {
      return res.status(401).json({ error: "Unauthenticated." });
    }

    const { role } = req.session;

    if (minimumRole === "OWNER" && role !== "OWNER") {
      return res.status(403).json({
        error: "This action requires Owner permissions.",
      });
    }

    // STAFF allows both STAFF and OWNER through
    next();
  };
}

module.exports = { requireRole };
