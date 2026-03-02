const express = require('express');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email transporter (move to config in production)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

// CREATE ORDER
router.post('/', async (req, res) => {
  try {
    const { customer, items, total, paymentMethod } = req.body;

    // Validation
    if (!customer || !items || !total) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide customer info, items, and total' 
      });
    }

    if (!items.length) {
      return res.status(400).json({ 
        success: false,
        message: 'No items in order' 
      });
    }

    const order = new Order({
      customer,
      items,
      total,
      paymentMethod: paymentMethod || 'cod',
      status: 'pending'
    });

    await order.save();

    // Send email confirmation
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: customer.email || 'customer@example.com',
        subject: `Order Confirmed - #${order._id}`,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Order ID: <strong>${order._id}</strong></p>
          <p>Total: ₹${total}</p>
          <p>Status: ${order.status}</p>
          <p>We'll notify you when your order ships.</p>
        `
      });
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// GET USER'S ORDERS
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.userId': req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      count: orders.length,
      orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// GET SINGLE ORDER
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    res.json({ 
      success: true,
      order 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// GET ALL ORDERS (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// UPDATE ORDER STATUS (Admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();

    // Send status update email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: order.customer.email || 'customer@example.com',
        subject: `Order Status Updated - #${order._id}`,
        html: `
          <h2>Your order status has been updated!</h2>
          <p>Order ID: <strong>${order._id}</strong></p>
          <p>New Status: <strong>${status}</strong></p>
          ${trackingNumber ? `<p>Tracking Number: ${trackingNumber}</p>` : ''}
        `
      });
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// CANCEL ORDER
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;