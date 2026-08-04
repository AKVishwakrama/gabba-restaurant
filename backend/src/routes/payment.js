const express = require("express");
const crypto = require("crypto");
const router = express.Router();

function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payment/create-order  { amount } -> Razorpay order for checkout
router.post("/create-order", async (req, res) => {
  const { amount } = req.body; // amount in rupees
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "A valid amount is required" });
  }
  const instance = getRazorpayInstance();
  if (!instance) {
    return res.status(503).json({
      error: "Payment gateway not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env",
    });
  }
  try {
    const order = await instance.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `gabba_rcpt_${Date.now()}`,
    });
    res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// POST /api/payment/verify - verifies Razorpay signature after checkout success
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment verification fields" });
  }
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ verified: false, error: "Signature mismatch - payment not verified" });
  }
  res.json({ verified: true });
});

module.exports = router;
