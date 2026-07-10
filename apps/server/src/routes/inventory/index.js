const { Router } = require("express");
const { requireSession } = require("../../middleware/require-session");
const { requireRole } = require("../../middleware/require-role");
const inventoryService = require("../../services/inventory.service");

const router = Router();
router.use(requireSession);

// GET /api/inventory?search=&cursor=&limit=
router.get("/", async (req, res) => {
  const result = await inventoryService.listProducts(req.session.activeShopId, req.query);
  res.json(result);
});

// GET /api/inventory/pending  — pending stock entries (Owner view)
router.get("/pending", requireRole("OWNER"), async (req, res) => {
  const data = await inventoryService.getPendingEntries(req.session.activeShopId);
  res.json({ data });
});

// GET /api/inventory/:id
router.get("/:id", async (req, res) => {
  const product = await inventoryService.getProduct(req.params.id, req.session.activeShopId);
  res.json(product);
});

// POST /api/inventory  (Owner only)
router.post("/", requireRole("OWNER"), async (req, res) => {
  const product = await inventoryService.createProduct(
    req.session.activeShopId, req.body, req.session.userId
  );
  res.status(201).json(product);
});

// PATCH /api/inventory/:id  (Owner only)
router.patch("/:id", requireRole("OWNER"), async (req, res) => {
  const product = await inventoryService.updateProduct(req.params.id, req.session.activeShopId, req.body);
  res.json(product);
});

// DELETE /api/inventory/:id  (Owner only)
router.delete("/:id", requireRole("OWNER"), async (req, res) => {
  await inventoryService.deleteProduct(req.params.id, req.session.activeShopId, req.session.userId);
  res.json({ success: true });
});

// POST /api/inventory/:id/batches  — add a new batch (Owner only)
router.post("/:id/batches", requireRole("OWNER"), async (req, res) => {
  const batch = await inventoryService.addBatch(req.params.id, req.session.activeShopId, req.body);
  res.status(201).json(batch);
});

// POST /api/inventory/stock-entry  — submit stock entry (any member)
router.post("/stock-entry", async (req, res) => {
  const entry = await inventoryService.submitStockEntry(
    req.session.activeShopId, req.body, req.session.userId
  );
  res.status(201).json(entry);
});

// POST /api/inventory/stock-entry/:id/review  — approve/reject (Owner only)
router.post("/stock-entry/:id/review", requireRole("OWNER"), async (req, res) => {
  const { approved, reviewNote } = req.body;
  const entry = await inventoryService.approveStockEntry(
    req.params.id, req.session.activeShopId, req.session.userId, approved, reviewNote
  );
  res.json(entry);
});

// POST /api/inventory/loss  — record a loss (any member)
router.post("/loss", async (req, res) => {
  const loss = await inventoryService.recordLoss(
    req.session.activeShopId, req.body, req.session.userId
  );
  res.status(201).json(loss);
});

module.exports = router;
