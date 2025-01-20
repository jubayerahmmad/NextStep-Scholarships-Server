require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

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

    // get a specific user  data by email
    app.get("/user/:email", async (req, res) => {
      const email = req?.params?.email;
      const query = { email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // update user
    app.patch("/update-user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const { name, image } = req.body;
      const filter = { email };
      const updatedDoc = {
        $set: {
          name,
          image,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // get user role
    app.get("/user-role/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      res.send({ role: user?.role });
    });

    // update user role
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

    // total data
    app.get("/total-scholarships", async (req, res) => {
      const total = await allScholarshipsCollection.estimatedDocumentCount();
      res.send({ total });
    });

    // get all scholarship
    app.get("/scholarships", async (req, res) => {
      let { search, page, limit } = req?.query;

      page = parseInt(page);
      limit = parseInt(limit);

      let query = {};

      if (search) {
        query = {
          //The $or operator takes an array of conditions. It matches a document if at least one of the conditions in the array is true.
          $or: [
            { scholarshipName: { $regex: search, $options: "i" } },
            { degree: { $regex: search, $options: "i" } },
            { universityName: { $regex: search, $options: "i" } },
          ],
        };
      }
      const result = await allScholarshipsCollection
        .find(query)
        .skip(page * limit)
        .limit(limit)
        .toArray();
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

    //  --------PAYMENT----------
    app.post("/create-payment-intent", verifyToken, async (req, res) => {
      const { fee } = req.body;
      const totalFee = fee * 100;

      const { client_secret } = await stripe.paymentIntents.create({
        amount: totalFee,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      // console.log(paymentIntent);
      res.send(client_secret);
    });

    // ------------APPLIED SCHOLARSHIPS APIs-----------
    // save applied scholarship details
    app.post("/applied-scholarships", verifyToken, async (req, res) => {
      const applyData = req.body;
      //TODO: prevent multiple apply to the same scholarship
      // const query = {
      //   scholarshipId: applyData.scholarshipId,
      //   applicantEmail: applyData.applicantEmail,
      // };

      // const applied = await appliedScholarshipsCollection.findOne(query);
      // if (applied) {
      //   return res.status(400).send({
      //     message: "You have Already Applied to this Scholarship",
      //   });
      // }

      const result = await appliedScholarshipsCollection.insertOne({
        ...applyData,
        status: "Pending",
      });
      res.send(result);
    });

    // get applied scholarship by email
    app.get("/my-applications/:email", verifyToken, async (req, res) => {
      const email = req?.params?.email;
      const result = await appliedScholarshipsCollection
        .find({ applicantEmail: email })
        .toArray();
      res.send(result);
    });

    // get all applied scholarships
    app.get("/applied-scholarships", verifyToken, async (req, res) => {
      const date = req.query?.date;

      let query = {};
      if (date === "applicationDeadline") {
        query = { applicationDeadline: 1 };
      }
      if (date === "appliedDate") {
        query = { appliedDate: 1 };
      }

      const result = await appliedScholarshipsCollection
        .find()
        .sort(query)
        .toArray();
      res.send(result);
    });

    // get applied scholarship by id
    app.get("/applied-scholarship/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await appliedScholarshipsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // update application data
    app.patch("/update-application/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const {
        city,
        country,
        studyGap,
        sscResult,
        applicantPhone,
        gender,
        hscResult,
      } = req.body;
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

      const result = await appliedScholarshipsCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    // change status of application
    app.patch("/change-status/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };

      const updatedDoc = {
        $set: {
          status,
        },
      };

      const result = await appliedScholarshipsCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    // delete application
    app.delete("/delete-application/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appliedScholarshipsCollection.deleteOne(query);
      res.send(result);
    });

    // add feedback
    app.patch("/add-feedback/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const { feedback } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          feedback,
        },
      };
      const result = await appliedScholarshipsCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    //  ------------REVIEWS APIs------------

    // save reviews
    app.post("/add-review/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const reviewData = req.body;
      // check if already reviewed to the scholarship
      const query = {
        scholarshipId: id,
        reviewerEmail: reviewData?.reviewerEmail,
      };
      const review = await reviewsCollection.findOne(query);

      if (review) {
        return res.status(400).send({ message: "Review Already Given!" });
      }
      const result = await reviewsCollection.insertOne(reviewData);
      res.send(result);
    });
    // get all reviews
    app.get("/reviews", verifyToken, async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });
    // get reviews by specific user
    app.get("/my-reviews/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = {
        reviewerEmail: email,
      };
      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });

    // get reviews by specific id(for specific scholarshi[] details page)
    app.get("/reviews/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { scholarshipId: id };
      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });
    // get reviews by specific id(for my reviews)
    app.get("/my-review/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });

    //update review
    app.patch("/update-review/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const { rating, review } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          rating,
          review,
        },
      };
      const result = await reviewsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // delete a review
    app.delete("/delete-review/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
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
