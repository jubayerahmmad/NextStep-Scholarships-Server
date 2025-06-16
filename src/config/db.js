const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nextstep-scholarships.bha7w.mongodb.net/?retryWrites=true&w=majority&appName=NextStep-Scholarships`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    // await client.connect();
    console.log("Successfully connected to MongoDB!");
    return client.db("NextStep-Scholarships");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

module.exports = { connectDB, client };
