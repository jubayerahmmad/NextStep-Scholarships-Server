const { ObjectId } = require("mongodb");

// Add scholarship
const addScholarship = async (db, scholarshipData) => {
  return await db.collection("all-scholarships").insertOne(scholarshipData);
};

// Get all scholarships for admin
const getAllScholarshipsForAdmin = async (db) => {
  return await db.collection("all-scholarships").find().toArray();
};

// Get total scholarships count
const getTotalScholarships = async (db) => {
  return await db.collection("all-scholarships").estimatedDocumentCount();
};

// Get all scholarships with pagination and search
const getAllScholarships = async (db, search, page, limit) => {
  let query = {};
  if (search) {
    query = {
      $or: [
        { scholarshipName: { $regex: search, $options: "i" } },
        { degree: { $regex: search, $options: "i" } },
        { universityName: { $regex: search, $options: "i" } },
      ],
    };
  }
  return await db
    .collection("all-scholarships")
    .aggregate([
      {
        $match: query,
      },
      {
        $addFields: {
          stringifiedId: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "stringifiedId",
          foreignField: "scholarshipId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          numberOfReviews: { $size: "$reviews" },
        },
      },
      {
        $project: {
          reviews: 0,
        },
      },
    ])
    .skip(page * limit)
    .limit(limit)
    .toArray();
};

// Get top scholarships
const getTopScholarships = async (db) => {
  return await db
    .collection("all-scholarships")
    .aggregate([
      {
        $addFields: {
          stringifiedId: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "stringifiedId",
          foreignField: "scholarshipId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          numberOfReviews: { $size: "$reviews" },
        },
      },
      {
        $sort: { applicationFees: 1, postDate: -1 },
      },
      {
        $limit: 6,
      },
      {
        $project: {
          reviews: 0,
        },
      },
    ])
    .toArray();
};

// Get specific scholarship
const getScholarshipById = async (db, id) => {
  const query = { _id: new ObjectId(id) };
  return await db.collection("all-scholarships").findOne(query);
};

// Update scholarship
const updateScholarship = async (db, id, updatedData) => {
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      description: updatedData.description,
      applicationFees: updatedData.applicationFees,
      universityName: updatedData.universityName,
      subjectCategory: updatedData.subjectCategory,
      applicationDeadline: updatedData.applicationDeadline,
      scholarshipCategory: updatedData.scholarshipCategory,
      city: updatedData.city,
      country: updatedData.country,
      scholarshipName: updatedData.scholarshipName,
      subjectName: updatedData.subjectName,
      stipend: updatedData.stipend,
      worldRank: updatedData.worldRank,
      degree: updatedData.degree,
      tuitionFees: updatedData.tuitionFees,
      serviceCharge: updatedData.serviceCharge,
      email: updatedData.email,
      postDate: updatedData.postDate,
      image: updatedData.image,
    },
  };
  return await db.collection("all-scholarships").updateOne(filter, updatedDoc);
};

// Delete scholarship
const deleteScholarship = async (db, id) => {
  const query = { _id: new ObjectId(id) };
  return await db.collection("all-scholarships").deleteOne(query);
};

module.exports = {
  addScholarship,
  getAllScholarshipsForAdmin,
  getTotalScholarships,
  getAllScholarships,
  getTopScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
};
