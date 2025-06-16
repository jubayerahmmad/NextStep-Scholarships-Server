// Get admin stats
const getAdminStats = async (db) => {
  const totalScholarships = await db
    .collection("all-scholarships")
    .estimatedDocumentCount();
  const totalApplications = await db
    .collection("applied-scholarships")
    .estimatedDocumentCount();
  const totalReviews = await db.collection("reviews").estimatedDocumentCount();

  const reviews = await db.collection("reviews").find().toArray();
  const ratings = reviews.reduce((total, rating) => total + rating.rating, 0);
  const avgRating = ratings / totalReviews;

  const chartData = await db
    .collection("applied-scholarships")
    .aggregate([
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $toDate: "$appliedDate" },
              },
            },
          },
          feesEarned: { $sum: "$applicationFees" },
          totalApplications: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          appliedDate: "$_id.date",
          feesEarned: 1,
          totalApplications: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ])
    .toArray();

  return {
    totalScholarships,
    totalApplications,
    totalReviews,
    avgRating,
    chartData,
  };
};

module.exports = {
  getAdminStats,
};
