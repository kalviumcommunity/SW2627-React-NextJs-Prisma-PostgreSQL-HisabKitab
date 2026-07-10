const { Router } = require("express");
const { requireSession } = require("../../middleware/require-session");
const notifRepo = require("../../repositories/notification.repository");
const dashboardService = require("../../services/dashboard.service");

const router = Router();
router.use(requireSession);

// GET /api/notifications?unreadOnly=true
router.get("/", async (req, res) => {
  const unreadOnly = req.query.unreadOnly === "true";
  const data = await notifRepo.findMany(
    req.session.activeShopId, req.session.userId, { unreadOnly }
  );
  const unreadCount = await notifRepo.countUnread(req.session.activeShopId, req.session.userId);
  res.json({ data, unreadCount });
});

// POST /api/notifications/:id/read
router.post("/:id/read", async (req, res) => {
  await notifRepo.markRead(req.params.id, req.session.userId);
  res.json({ success: true });
});

// POST /api/notifications/read-all
router.post("/read-all", async (req, res) => {
  await notifRepo.markAllRead(req.session.activeShopId, req.session.userId);
  res.json({ success: true });
});

// GET /api/notifications/dashboard  — summary for the active shop
router.get("/dashboard", async (req, res) => {
  const summary = await dashboardService.getSummary(req.session.activeShopId);
  res.json(summary);
});

// GET /api/notifications/earnings?period=2024-06
router.get("/earnings", async (req, res) => {
  const period = req.query.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const data = await dashboardService.getEarningsRollup(req.session.activeShopId, period);
  res.json(data);
});

module.exports = router;
