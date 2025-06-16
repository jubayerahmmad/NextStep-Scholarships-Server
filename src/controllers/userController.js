const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

// JWT token generation
const generateToken = (userEmail) => {
  return jwt.sign(userEmail, process.env.TOKEN_SECRET, {
    expiresIn: "365d",
  });
};

// Save user
const saveUser = async (db, email, userInfo) => {
  const isExist = await db.collection("users").findOne({ email });
  if (isExist) return isExist;

  const result = await db.collection("users").insertOne({
    ...userInfo,
    role: "User",
  });
  return result;
};

// Get all users
const getAllUsers = async (db, email, sort) => {
  let query = { email: { $ne: email } };
  if (sort) {
    query.role = sort;
  }
  return await db.collection("users").find(query).toArray();
};

// Get specific user
const getUserByEmail = async (db, email) => {
  return await db.collection("users").findOne({ email });
};

// Update user
const updateUser = async (db, email, userData) => {
  const { name, image, phone, address } = userData;
  const filter = { email };
  const updatedDoc = {
    $set: {
      name,
      image,
      phone,
      address,
    },
  };
  const options = { upsert: true };
  return await db.collection("users").updateOne(filter, updatedDoc, options);
};

// Get user role
const getUserRole = async (db, email) => {
  const user = await db.collection("users").findOne({ email });
  return { role: user?.role };
};

// Update user role
const updateUserRole = async (db, email, role) => {
  const filter = { email };
  const updatedDoc = {
    $set: { role },
  };
  return await db.collection("users").updateOne(filter, updatedDoc);
};

// Delete user
const deleteUser = async (db, id) => {
  return await db.collection("users").deleteOne({
    _id: new ObjectId(id),
  });
};

module.exports = {
  generateToken,
  saveUser,
  getAllUsers,
  getUserByEmail,
  updateUser,
  getUserRole,
  updateUserRole,
  deleteUser,
};
