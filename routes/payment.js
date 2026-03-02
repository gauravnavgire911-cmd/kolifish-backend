const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ============================================
// CREATE RAZORPAY ORDER
// ============================================
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Create order in Razorpay
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user.id
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create pending order in database
    const order = new Order({
      user: req.user.id,
      customer: req.body.customer,
      items: req.body.items,
      totalPrice: amount,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Razorpay order created',
      razorpayOrder,
      orderId: order._id
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order: ' + error.message
    });
  }
});

// ============================================
// VERIFY PAYMENT
// ============================================
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      // Update order as failed
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        status: 'cancelled'
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid signature. Payment verification failed!'
      });
    }

    // Update order as paid
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        paymentId: razorpayPaymentId,
        razorpayPaymentId: razorpayPaymentId,
        isPaid: true,
        paidAt: new Date(),
        status: 'confirmed'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed: ' + error.message
    });
  }
});

// ============================================
// WEBHOOK - Handle payment events
// ============================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  try {
    // Verify webhook signature
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (generatedSignature !== signature) {
      console.log('Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body);
    const paymentId = event.payload.payment.entity.id;
    const orderId = event.payload.payment.entity.order_id;

    // Handle different events
    switch (event.event) {
      case 'payment.captured':
        await Order.findOneAndUpdate(
          { razorpayOrderId: orderId },
          {
            paymentStatus: 'paid',
            isPaid: true,
            paidAt: new Date(),
            status: 'confirmed'
          }
        );
        console.log(`Payment captured: ${paymentId}`);
        break;

      case 'payment.failed':
        await Order.findOneAndUpdate(
          { razorpayOrderId: orderId },
          {
            paymentStatus: 'failed',
            status: 'cancelled'
          }
        );
        console.log(`Payment failed: ${paymentId}`);
        break;

      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook处理失败' });
  }
});

// ============================================
// GET KEY (For frontend)
// ============================================
router.get('/key', (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
});

// ============================================
// REFUND (Admin)
// ============================================
router.post('/refund/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is not paid'
      });
    }

    // Initiate refund
    const refund = await razorpay.payments.refund(order.paymentId, {
      amount: Math.round(order.totalPrice * 100) // Full refund
    });

    // Update order
    order.refundStatus = 'processed';
    order.refundAmount = order.totalPrice;
    order.refundId = refund.id;
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    
    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund failed: ' + error.message
    });
  }
});

module.exports = router;