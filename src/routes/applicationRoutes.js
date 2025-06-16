const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyOnlyAdmin,
  verifyAdminModerator,
} = require("../middleware/auth");
const {
  saveApplication,
  getUserApplications,
  getAllApplications,
  getApplicationById,
  updateApplication,
  changeApplicationStatus,
  deleteApplication,
  addFeedback,
} = require("../controllers/applicationController");

// Save application
router.post("/applied-scholarships", verifyToken, async (req, res) => {
  const result = await saveApplication(req.db, req.body);
  res.send(result);
});

// Get user's applications
router.get("/my-applications/:email", verifyToken, async (req, res) => {
  const result = await getUserApplications(req.db, req.params.email);
  res.send(result);
});

// Get all applications
router.get(
  "/applied-scholarships",
  verifyToken,
  verifyAdminModerator,
  async (req, res) => {
    const result = await getAllApplications(req.db, req.query.date);
    res.send(result);
  }
);

// Get specific application
router.get("/applied-scholarship/:id", verifyToken, async (req, res) => {
  const result = await getApplicationById(req.db, req.params.id);
  res.send(result);
});

// Update application
router.patch("/update-application/:id", verifyToken, async (req, res) => {
  const result = await updateApplication(req.db, req.params.id, req.body);
  res.send(result);
});

// Change application status
router.patch(
  "/change-status/:id",
  verifyToken,
  verifyAdminModerator,
  async (req, res) => {
    const result = await changeApplicationStatus(
      req.db,
      req.params.id,
      req.body.status
    );
    res.send(result);
  }
);

// Delete application
router.delete(
  "/delete-application/:id",
  verifyToken,
  verifyOnlyAdmin,
  async (req, res) => {
    const result = await deleteApplication(req.db, req.params.id);
    res.send(result);
  }
);

// Add feedback
router.patch(
  "/add-feedback/:id",
  verifyToken,
  verifyAdminModerator,
  async (req, res) => {
    const result = await addFeedback(req.db, req.params.id, req.body.feedback);
    res.send(result);
  }
);

module.exports = router;
