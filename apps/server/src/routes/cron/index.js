const { Router } = require("express");
const { handleExpiryCheck } = require("../../jobs/expiry-check.job");

const router = Router();

// Shared secret guard — cron-job.org sends this header
function requireCronSecret(req, res, next) {
  const secret = req.headers["x-cron-secret"];
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized cron request." });
  }
  next();
}

// POST /api/cron/expiry-check
// Called by cron-job.org on a daily schedule
router.post("/expiry-check", requireCronSecret, async (req, res) => {
  const result = await handleExpiryCheck();
  res.json({ success: true, ...result });
});

module.exports = router;
