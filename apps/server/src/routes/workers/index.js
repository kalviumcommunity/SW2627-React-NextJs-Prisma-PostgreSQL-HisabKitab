const { Router } = require("express");
const { requireSession } = require("../../middleware/require-session");
const { requireRole } = require("../../middleware/require-role");
const workerService = require("../../services/worker.service");

const router = Router();
router.use(requireSession);

// GET /api/workers
router.get("/", async (req, res) => {
  const data = await workerService.listWorkers(req.session.activeShopId);
  res.json({ data });
});

// GET /api/workers/:id
router.get("/:id", async (req, res) => {
  const worker = await workerService.getWorker(req.params.id, req.session.activeShopId);
  res.json(worker);
});

// POST /api/workers  (Owner only)
router.post("/", requireRole("OWNER"), async (req, res) => {
  const worker = await workerService.createWorker(req.session.activeShopId, req.body);
  res.status(201).json(worker);
});

// PATCH /api/workers/:id  (Owner only)
router.patch("/:id", requireRole("OWNER"), async (req, res) => {
  const worker = await workerService.updateWorker(req.params.id, req.session.activeShopId, req.body);
  res.json(worker);
});

// DELETE /api/workers/:id  (Owner only)
router.delete("/:id", requireRole("OWNER"), async (req, res) => {
  await workerService.deleteWorker(req.params.id, req.session.activeShopId, req.session.userId);
  res.json({ success: true });
});

// POST /api/workers/:id/attendance
router.post("/:id/attendance", async (req, res) => {
  const record = await workerService.markAttendance(
    req.params.id, req.session.activeShopId, req.body, req.session.userId
  );
  res.json(record);
});

// POST /api/workers/salary  — record salary (any member)
router.post("/salary", async (req, res) => {
  const payment = await workerService.recordSalaryPayment(
    req.session.activeShopId, req.body, req.session.userId
  );
  res.status(201).json(payment);
});

// POST /api/workers/salary/:id/approve  (Owner only)
router.post("/salary/:id/approve", requireRole("OWNER"), async (req, res) => {
  const payment = await workerService.approveSalaryPayment(
    req.params.id, req.session.activeShopId, req.session.userId
  );
  res.json(payment);
});

module.exports = router;
