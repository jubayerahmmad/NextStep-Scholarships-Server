const express = require("express");
const router = express.Router();
const { verifyToken, verifyOnlyAdmin } = require("../middleware/auth");
const {
  generateToken,
  saveUser,
  getAllUsers,
  getUserByEmail,
  updateUser,
  getUserRole,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

// JWT route
router.post("/jwt", (req, res) => {
  const token = generateToken(req.body);
  res.send({ token });
});

// Save user
router.post("/save-user/:email", async (req, res) => {
  const result = await saveUser(req.db, req.params.email, req.body);
  res.send(result);
});

// Get all users
router.get(
  "/all-users/:email",
  verifyToken,
  verifyOnlyAdmin,
  async (req, res) => {
    const result = await getAllUsers(req.db, req.params.email, req.query.sort);
    res.send(result);
  }
);

// Get specific user
router.get("/user/:email", async (req, res) => {
  const result = await getUserByEmail(req.db, req.params.email);
  res.send(result);
});

// Update user
router.patch("/update-user/:email", verifyToken, async (req, res) => {
  const result = await updateUser(req.db, req.params.email, req.body);
  res.send(result);
});

// Get user role
router.get("/user-role/:email", verifyToken, async (req, res) => {
  const result = await getUserRole(req.db, req.params.email);
  res.send(result);
});

// Update user role
router.patch(
  "/update-role/:email",
  verifyToken,
  verifyOnlyAdmin,
  async (req, res) => {
    const result = await updateUserRole(
      req.db,
      req.params.email,
      req.body.role
    );
    res.send(result);
  }
);

// Delete user
router.delete(
  "/delete-user/:id",
  verifyToken,
  verifyOnlyAdmin,
  async (req, res) => {
    const result = await deleteUser(req.db, req.params.id);
    res.send(result);
  }
);

module.exports = router;
