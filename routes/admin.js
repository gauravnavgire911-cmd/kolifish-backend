const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload image and add product
router.post('/product', auth, upload.single('image'), async (req, res) => {
  try {
    // Validate required fields
    const { name, price, category, description } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, price, and category are required' 
      });
    }

    const productData = {
      name,
      price: Number(price),
      category,
      description: description || '',
    };

    // Use uploaded file or placeholder
    if (req.file) {
      productData.image = req.file.path;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update product
router.put('/product/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Delete product
router.delete('/product/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;