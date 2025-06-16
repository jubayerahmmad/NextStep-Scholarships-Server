const express = require("express");
const router = express.Router();
const { verifyToken, verifyOnlyAdmin } = require("../middleware/auth");
const { getAdminStats } = require("../controllers/adminController");

// Get admin stats
router.get("/admin-stats", verifyToken, verifyOnlyAdmin, async (req, res) => {
  const result = await getAdminStats(req.db);
  res.send(result);
});

module.exports = router;
