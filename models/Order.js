const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  customer: { name: String, phone: String, address: String, pincode: String },
  items: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number }],
  total: Number,
  status: { type: String, default: 'Pending' },
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', orderSchema);