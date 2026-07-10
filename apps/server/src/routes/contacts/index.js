const { Router } = require("express");
const { requireSession } = require("../../middleware/require-session");
const { requireRole } = require("../../middleware/require-role");
const contactService = require("../../services/contact.service");

const router = Router();

// All contact routes require a valid session
router.use(requireSession);

// GET /api/contacts?search=&cursor=&limit=&contactType=
router.get("/", async (req, res) => {
  const { search, cursor, limit, contactType } = req.query;
  const result = await contactService.listContacts(req.session.activeShopId, {
    search,
    cursor,
    limit: limit ? parseInt(limit) : 20,
    contactType,
  });
  res.json(result);
});

// GET /api/contacts/trash
router.get("/trash", async (req, res) => {
  const data = await contactService.getTrashedContacts(req.session.activeShopId);
  res.json({ data });
});

// GET /api/contacts/:id
router.get("/:id", async (req, res) => {
  const contact = await contactService.getContact(req.params.id, req.session.activeShopId);
  res.json(contact);
});

// POST /api/contacts
router.post("/", async (req, res) => {
  const contact = await contactService.createContact(req.session.activeShopId, req.body);
  res.status(201).json(contact);
});

// PATCH /api/contacts/:id
router.patch("/:id", async (req, res) => {
  const contact = await contactService.updateContact(req.params.id, req.session.activeShopId, req.body);
  res.json(contact);
});

// DELETE /api/contacts/:id
router.delete("/:id", async (req, res) => {
  await contactService.deleteContact(req.params.id, req.session.activeShopId, req.session.userId);
  res.json({ success: true });
});

// POST /api/contacts/:id/restore  (Owner or configurable Staff)
router.post("/:id/restore", async (req, res) => {
  const contact = await contactService.restoreContact(req.params.id, req.session.activeShopId);
  res.json(contact);
});

module.exports = router;
