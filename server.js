require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
      const sort = req.query.sort;

      let query = { email: { $ne: email } };

      if (sort) {
        query.role = sort;
      }

      const result = await usersCollection.find(query).toArray();

      res.send(result);
    });

    // get user role
    app.get("/user-role/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      res.send({ role: user?.role });
    });

    // handle user role
    app.patch("/update-role/:email", verifyToken, async (req, res) => {
      const email = req?.params?.email;
      const { role } = req.body;

      const filter = { email };
      const updatedDoc = {
        $set: {
          role,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // delete user
    app.delete("/delete-user/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //  ----------- ALL SCHOLARSHIPS APIs -----------

    // save a scholarship
    app.post("/add-scholarship", verifyToken, async (req, res) => {
      const scholarshipData = req.body;
      const result = await allScholarshipsCollection.insertOne(scholarshipData);
      res.send(result);
    });

    // get all scholarship for admins
    app.get("/scholarship-admin-access", verifyToken, async (req, res) => {
      const result = await allScholarshipsCollection.find().toArray();
      res.send(result);
    });

    // get all scholarship
    app.get("/scholarships", async (req, res) => {
      const result = await allScholarshipsCollection.find().toArray();
      res.send(result);
    });

    //TODO: get top 6 scholarship based on lowest application fees and  latest postedDate
    app.get("/top-scholarships", async (req, res) => {
      const result = await allScholarshipsCollection
        .find()
        .limit(6)
        .sort({ applicationFees: 1, postDate: -1 })
        .toArray();
      res.send(result);
    });

    // get specific scholarship by id
    app.get("/scholarship/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const scholarship = await allScholarshipsCollection.findOne(query);
      res.send(scholarship);
    });

    // update scholarship
    app.put("/update-scholarship/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
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
      const result = await allScholarshipsCollection.updateOne(
        filter,
        updatedDoc
      );

      res.send(result);
    });

    // delete specific scholarship by id
    app.delete("/delete-scholarship/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allScholarshipsCollection.deleteOne(query);
      res.send(result);
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
