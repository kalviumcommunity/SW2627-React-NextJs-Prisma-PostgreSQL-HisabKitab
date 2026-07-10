const { Router } = require("express");
const { requireSession } = require("../../middleware/require-session");
const { requireRole } = require("../../middleware/require-role");
const txnService = require("../../services/transaction.service");
const shopRepo = require("../../repositories/shop.repository");

const router = Router();
router.use(requireSession);

// Helper: get shop settings + role for permission checks
async function getShopCtx(req) {
  const shop = await shopRepo.findById(req.session.activeShopId);
  return { ...shop, role: req.session.role };
}

// GET /api/transactions?contactId=&cursor=&limit=&type=
router.get("/", async (req, res) => {
  const { contactId, cursor, limit, type } = req.query;
  const result = await txnService.listTransactions(req.session.activeShopId, {
    contactId, cursor, limit: limit ? parseInt(limit) : 20, type,
  });
  res.json(result);
});

// GET /api/transactions/:id
router.get("/:id", async (req, res) => {
  const txn = await txnService.getTransaction(req.params.id, req.session.activeShopId);
  res.json(txn);
});

// POST /api/transactions
router.post("/", async (req, res) => {
  const txn = await txnService.createTransaction(
    req.session.activeShopId, req.body, req.session.userId
  );
  res.status(201).json(txn);
});

// POST /api/transactions/:id/lock
router.post("/:id/lock", async (req, res) => {
  const result = await txnService.acquireEditLock(
    req.params.id, req.session.activeShopId, req.session.userId
  );
  res.json(result);
});

// DELETE /api/transactions/:id/lock
router.delete("/:id/lock", async (req, res) => {
  const result = await txnService.releaseEditLock(
    req.params.id, req.session.activeShopId, req.session.userId
  );
  res.json(result);
});

// PATCH /api/transactions/:id
router.patch("/:id", async (req, res) => {
  const shopCtx = await getShopCtx(req);
  const txn = await txnService.updateTransaction(
    req.params.id, req.session.activeShopId, req.body, req.session.userId, shopCtx
  );
  res.json(txn);
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  const shopCtx = await getShopCtx(req);
  await txnService.deleteTransaction(
    req.params.id, req.session.activeShopId, req.session.userId, shopCtx
  );
  res.json({ success: true });
});

module.exports = router;
