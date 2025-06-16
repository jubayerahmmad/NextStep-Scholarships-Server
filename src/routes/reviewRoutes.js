const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  addReview,
  getAllReviews,
  getUserReviews,
  getScholarshipReviews,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

// Add review
router.post("/add-review/:id", verifyToken, async (req, res) => {
  try {
    const result = await addReview(req.db, req.params.id, req.body);
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message || "Error adding review" });
  }
});

// Get all reviews
router.get("/reviews", async (req, res) => {
  const result = await getAllReviews(req.db);
  res.send(result);
});

// Get user's reviews
router.get("/my-reviews/:email", verifyToken, async (req, res) => {
  const result = await getUserReviews(req.db, req.params.email);
  res.send(result);
});

// Get reviews by specific id(for specific scholarship details page)
router.get("/reviews/:id", verifyToken, async (req, res) => {
  const result = await getScholarshipReviews(req.db, req.params.id);
  res.send(result);
});

// Get specific review
router.get("/my-review/:id", verifyToken, async (req, res) => {
  const result = await getReviewById(req.db, req.params.id);
  res.send(result);
});

// Update review
router.patch("/update-review/:id", verifyToken, async (req, res) => {
  const result = await updateReview(req.db, req.params.id, req.body);
  res.send(result);
});

// Delete review
router.delete("/delete-review/:id", verifyToken, async (req, res) => {
  const result = await deleteReview(req.db, req.params.id);
  res.send(result);
});

module.exports = router;
