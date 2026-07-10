const { Router } = require("express");
const { requireSession } = require("../../middleware/require-session");
const { getSseClients, addSseClient, removeSseClient } = require("../../realtime/pg-listener");

const router = Router();

// GET /api/sse  — Server-Sent Events stream for real-time updates
router.get("/", requireSession, (req, res) => {
  const { userId, activeShopId } = req.session;

  // Set SSE headers
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no", // disable Nginx buffering
  });
  res.flushHeaders();

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: "connected", userId, shopId: activeShopId })}\n\n`);

  // Register client
  const clientId = `${userId}-${Date.now()}`;
  addSseClient(clientId, { res, userId, shopId: activeShopId });

  // Keep-alive ping every 30s
  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(pingInterval);
    removeSseClient(clientId);
  });
});

module.exports = router;
