const { ObjectId } = require("mongodb");

// Add review
const addReview = async (db, id, reviewData) => {
  // check if already reviewed to the scholarship
  const query = {
    scholarshipId: id,
    reviewerEmail: reviewData?.reviewerEmail,
  };
  const review = await db.collection("reviews").findOne(query);

  if (review) {
    return res.status(400).send({ message: "Review Already Given!" });
  }
  return await db.collection("reviews").insertOne(reviewData);
};

// Get all reviews
const getAllReviews = async (db) => {
  return await db.collection("reviews").find().toArray();
};

// Get user's reviews
const getUserReviews = async (db, email) => {
  const query = {
    reviewerEmail: email,
  };
  return await db.collection("reviews").find(query).toArray();
};

// Get reviews for specific scholarship
const getScholarshipReviews = async (db, id) => {
  const query = { scholarshipId: id };
  return await db.collection("reviews").find(query).toArray();
};

// Get specific review
const getReviewById = async (db, id) => {
  const query = { _id: new ObjectId(id) };
  return await db.collection("reviews").findOne(query);
};

// Update review
const updateReview = async (db, id, reviewData) => {
  const { rating, review } = reviewData;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      rating,
      review,
    },
  };
  return await db.collection("reviews").updateOne(filter, updatedDoc);
};

// Delete review
const deleteReview = async (db, id) => {
  const query = { _id: new ObjectId(id) };
  return await db.collection("reviews").deleteOne(query);
};

module.exports = {
  addReview,
  getAllReviews,
  getUserReviews,
  getScholarshipReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
