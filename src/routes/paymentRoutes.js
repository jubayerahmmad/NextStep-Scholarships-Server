const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { createPaymentIntent } = require("../controllers/paymentController");

// Create payment intent
router.post("/create-payment-intent", verifyToken, async (req, res) => {
  try {
    const { fee } = req.body;
    const clientSecret = await createPaymentIntent(fee);
    res.send({ clientSecret });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
