const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// Seed route to add sample products
router.post("/seed", async (req, res) => {
  try {
    const products = [
      {
        name: "Bombay Duck",
        price: 150.0,
        description:
          "Fresh, sustainably sourced Bombay Duck from Maharashtra's coastal regions. A delicacy in local cuisine.",
        image: "https://kolifish.com/images/bombay-duck.jpg",
        category: "Saltwater Fish",
      },
      {
        name: "Pomfret",
        price: 250.0,
        description:
          "Premium white pomfret, known for its delicate flavor and flaky texture. Ideal for grilling or curries.",
        image: "https://kolifish.com/images/pomfret.jpg",
        category: "Saltwater Fish",
      },
    ];

    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(products);

    return res.json({
      msg: "Fish products added successfully",
      insertedCount: insertedProducts.length,
    });
  } catch (error) {
    console.error("Error in seeding products:", error);
    return res.status(500).json({ msg: error.message });
  }
});

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = router;