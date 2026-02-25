const express = require('express');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const router = express.Router();

// Create order
router.post('/', async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  // Send email confirmation
  const transporter = nodemailer.createTransporter({ service: 'gmail', auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS } });
  transporter.sendMail({ from: process.env.EMAIL, to: 'customer@example.com', subject: 'Order Confirmed', text: `Order ID: ${order._id}` });
  res.json(order);
});

// Get orders (admin)
router.get('/', require('../middleware/auth'), async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});
module.exports = router;