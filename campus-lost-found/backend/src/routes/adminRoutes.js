const router = require("express").Router();

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth");

const {
  listClaims,
  updateClaim,
  markReturned,
  listAdminItems,
  updateItemStatus,
  stats,
  listHighConfidenceMatches,
  confirmMatch,
  returnMatchedItems,
} = require("../controllers/claimController");

router.use(authenticate, requireAdmin);

// Dashboard statistics
router.get("/stats", stats);

// High-confidence matching
router.get(
  "/matches/high-confidence",
  listHighConfidenceMatches
);

// Confirm a 90%+ match
router.patch(
  "/matches/:matchId/confirm",
  confirmMatch
);

// Mark both matched reports as returned
router.patch(
  "/matches/:matchId/return",
  returnMatchedItems
);

// Item management
router.get("/items", listAdminItems);

router.patch(
  "/items/:id/status",
  updateItemStatus
);

// Claim management
router.get("/claims", listClaims);

router.patch(
  "/claims/:id",
  updateClaim
);

// Individual item return
router.patch(
  "/items/:id/return",
  markReturned
);

module.exports = router;