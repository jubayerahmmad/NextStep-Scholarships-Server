require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const port = process.env.PORT || 5000;
const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cors());

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized User" });
  }
  const token = req.headers?.authorization.split(" ")[1];
  // console.log(token);
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized User" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nextstep-scholarships.bha7w.mongodb.net/?retryWrites=true&w=majority&appName=NextStep-Scholarships`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("NextStep-Scholarships");
    // ---------- COLLECTIONS ----------
    const usersCollection = db.collection("users");
    const allScholarshipsCollection = db.collection("all-scholarships");
    const appliedScholarshipsCollection = db.collection("applied-scholarships");
    const reviewsCollection = db.collection("reviews");
    // -----JWT------
    app.post("/jwt", (req, res) => {
      const userEmail = req.body;
      const token = jwt.sign(userEmail, process.env.TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res.send({ token });
    });

    // ----------USER APIs----------
    //save a user to db
    app.post("/save-user/:email", async (req, res) => {
      const email = req.params.email;
      const userInfo = req.body;

      // validate if user already exists
      const isExist = await usersCollection.findOne({ email });
      if (isExist) return res.send(isExist);

      const result = await usersCollection.insertOne({
        ...userInfo,
        role: "User",
      });
      res.send(result);
    });

    //  get all user data
    app.get("/all-users/:email", verifyToken, async (req, res) => {
      const email = req?.params?.email;
      const result = await usersCollection
        .find({ email: { $ne: email } })
        .toArray();
      // console.log(result);
      res.send(result);
    });

    // get user role
    app.get("/user-role/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });

      res.send({ role: user?.role });
    });
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from NextStep Scholarships Server..");
});

app.listen(port, () => {
  console.log(`NextStep Scholarships is running on port ${port}`);
});
