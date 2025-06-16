const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (fee) => {
  const totalFee = fee * 100;
  const { client_secret } = await stripe.paymentIntents.create({
    amount: totalFee,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  return client_secret;
};

module.exports = {
  createPaymentIntent,
};
