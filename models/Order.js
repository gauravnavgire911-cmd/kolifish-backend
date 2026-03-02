// models/Order.js

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
  unit: String
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: {
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    pincode: { type: String, required: true }
  },
  items: [orderItemSchema],
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, required: true, enum: ['cod', 'card', 'upi', 'razorpay', 'paytm'] },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'], default: 'pending' },
  trackingNumber: String,
  courierPartner: String,
  orderNotes: String,
  shippingAddress: {
    name: String, address: String, city: String, state: String, pincode: String, phone: String
  },
  billingAddress: {
    name: String, address: String, city: String, state: String, pincode: String, phone: String
  },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  shippedAt: Date,
  confirmedAt: Date,
  processingAt: Date,
  packedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  cancelledBy: { type: String, enum: ['user', 'admin', 'system'] },
  returnReason: String,
  returnedAt: Date,
  refundAmount: Number,
  refundId: String,
  refundStatus: { type: String, enum: ['none', 'initiated', 'processed', 'rejected'], default: 'none' },
  otp: String,
  otpVerified: { type: Boolean, default: false },
  deliveryAttempts: { type: Number, default: 0 },
  lastDeliveryAttempt: Date,
  deliveryNotes: String
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Order', orderSchema);