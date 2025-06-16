const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyOnlyAdmin,
  verifyAdminModerator,
} = require("../middleware/auth");
const {
  addScholarship,
  getAllScholarshipsForAdmin,
  getTotalScholarships,
  getAllScholarships,
  getTopScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
} = require("../controllers/scholarshipController");

// Add scholarship
router.post(
  "/add-scholarship",
  verifyToken,
  verifyAdminModerator,
  async (req, res) => {
    const result = await addScholarship(req.db, req.body);
    res.send(result);
  }
);

// Get all scholarships for admin
router.get(
  "/scholarship-admin-access",
  verifyToken,
  verifyAdminModerator,
  async (req, res) => {
    const result = await getAllScholarshipsForAdmin(req.db);
    res.send(result);
  }
);

// Get total scholarships count
router.get("/total-scholarships", async (req, res) => {
  const result = await getTotalScholarships(req.db);
  res.send({ total: result });
});

// Get all scholarships with pagination and search
router.get("/scholarships", async (req, res) => {
  const { search, page, limit } = req.query;
  const result = await getAllScholarships(
    req.db,
    search,
    parseInt(page),
    parseInt(limit)
  );
  res.send(result);
});

// Get top scholarships
router.get("/top-scholarships", async (req, res) => {
  const result = await getTopScholarships(req.db);
  res.send(result);
});

// Get specific scholarship
router.get("/scholarship/:id", async (req, res) => {
  const result = await getScholarshipById(req.db, req.params.id);
  res.send(result);
});

// Update scholarship
router.patch(
  "/update-scholarship/:id",
  verifyToken,
  verifyOnlyAdmin,
  async (req, res) => {
    const result = await updateScholarship(req.db, req.params.id, req.body);
    res.send(result);
  }
);

// Delete scholarship
router.delete(
  "/delete-scholarship/:id",
  verifyToken,
  verifyOnlyAdmin,
  async (req, res) => {
    const result = await deleteScholarship(req.db, req.params.id);
    res.send(result);
  }
);

module.exports = router;
