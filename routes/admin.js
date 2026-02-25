const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload image and add product
router.post('/product', require('../middleware/auth'), upload.single('image'), async (req, res) => {
  const product = new Product({ ...req.body, image: req.file.path });
  await product.save();
  res.json(product);
});
module.exports = router;