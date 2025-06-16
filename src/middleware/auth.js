const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized User" });
  }
  const token = req.headers?.authorization.split(" ")[1];

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized User" });
    }
    req.user = decoded;
    next();
  });
};

const verifyOnlyAdmin = async (req, res, next) => {
  const email = req.user?.email;
  const query = { email };
  const user = await req.db.collection("users").findOne(query);
  if (!user || user.role !== "Admin") {
    return res.status(403).send({
      message: "Forbidden Access. Admin Access Only",
    });
  }
  next();
};

const verifyAdminModerator = async (req, res, next) => {
  const email = req.user?.email;
  const query = { email };
  const user = await req.db.collection("users").findOne(query);
  if (!user || (user.role !== "Admin" && user.role !== "Moderator")) {
    return res.status(403).send({
      message: "Forbidden Access. Admin, Moderator Access Only",
    });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyOnlyAdmin,
  verifyAdminModerator,
};
