const { ObjectId } = require("mongodb");

// Save application
const saveApplication = async (db, applyData) => {
  return await db.collection("applied-scholarships").insertOne({
    ...applyData,
    status: "Pending",
  });
};

// Get user's applications
const getUserApplications = async (db, email) => {
  return await db
    .collection("applied-scholarships")
    .find({ applicantEmail: email })
    .toArray();
};

// Get all applications
const getAllApplications = async (db, date) => {
  let query = {};
  if (date === "applicationDeadline") {
    query = { applicationDeadline: 1 };
  }
  if (date === "appliedDate") {
    query = { appliedDate: 1 };
  }

  return await db
    .collection("applied-scholarships")
    .find()
    .sort(query)
    .toArray();
};

// Get specific application
const getApplicationById = async (db, id) => {
  return await db.collection("applied-scholarships").findOne({
    _id: new ObjectId(id),
  });
};

// Update application
const updateApplication = async (db, id, applicationData) => {
  const {
    city,
    country,
    studyGap,
    sscResult,
    applicantPhone,
    gender,
    hscResult,
  } = applicationData;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      applicantPhone,
      city,
      country,
      sscResult,
      hscResult,
      studyGap,
      gender,
    },
  };

  return await db
    .collection("applied-scholarships")
    .updateOne(filter, updatedDoc);
};

// Change application status
const changeApplicationStatus = async (db, id, status) => {
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: { status },
  };

  return await db
    .collection("applied-scholarships")
    .updateOne(filter, updatedDoc);
};

// Delete application
const deleteApplication = async (db, id) => {
  const query = { _id: new ObjectId(id) };
  return await db.collection("applied-scholarships").deleteOne(query);
};

// Add feedback
const addFeedback = async (db, id, feedback) => {
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: { feedback },
  };
  return await db
    .collection("applied-scholarships")
    .updateOne(filter, updatedDoc);
};

module.exports = {
  saveApplication,
  getUserApplications,
  getAllApplications,
  getApplicationById,
  updateApplication,
  changeApplicationStatus,
  deleteApplication,
  addFeedback,
};
