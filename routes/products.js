const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// ============================================
// SEED PRODUCTS (TEMP - PROTECT LATER)
// NOTE: Keep this ABOVE "/:id"
// ============================================
router.post("/seed", async (req, res) => {
  try {
    const products = [
      {
        name: "Bombay Duck (Bombil)",
        price: 150,
        description:
          "Fresh, sustainably sourced Bombay Duck from Maharashtra's coastal regions.",
        image: "https://kolifish.com/images/bombay-duck.jpg",
        category: "Saltwater Fish",
        isActive: true,
      },
      {
        name: "Pomfret",
        price: 250,
        description:
          "Premium white pomfret, known for its delicate flavor and flaky texture.",
        image: "https://kolifish.com/images/pomfret.jpg",
        category: "Saltwater Fish",
        isActive: true,
      },
      {
        name: "Hilsa",
        price: 350,
        description: "Popular Hilsa fish, prized for its rich taste.",
        image: "https://kolifish.com/images/hilsa.jpg",
        category: "Saltwater Fish",
        isActive: true,
      },
      {
        name: "Surmai (King Fish)",
        price: 400,
        description: "King fish known for its firm texture and rich flavor.",
        image: "https://kolifish.com/images/surmai.jpg",
        category: "Saltwater Fish",
        isActive: true,
      },
      {
        name: "Rohu",
        price: 120,
        description: "Freshwater Rohu fish, perfect for Indian dishes.",
        image: "https://kolifish.com/images/rohu.jpg",
        category: "Freshwater Fish",
        isActive: true,
      },
      {
        name: "Catla",
        price: 130,
        description: "Large freshwater Catla, ideal for festive meals.",
        image: "https://kolifish.com/images/catla.jpg",
        category: "Freshwater Fish",
        isActive: true,
      },
      {
        name: "Prawns (Large)",
        price: 450,
        description: "Fresh large prawns, perfect for biryani and curries.",
        image: "https://kolifish.com/images/prawns.jpg",
        category: "Shellfish",
        isActive: true,
      },
      {
        name: "Crabs",
        price: 300,
        description: "Fresh water crabs, meaty and delicious.",
        image: "https://kolifish.com/images/crabs.jpg",
        category: "Shellfish",
        isActive: true,
      },
      {
        name: "Dry Fish (Bombay Duck)",
        price: 200,
        description:
          "Sun-dried Bombay Duck, traditional Maharashtrian delicacy.",
        image: "https://kolifish.com/images/dry-fish.jpg",
        category: "Dry Fish",
        isActive: true,
      },
      {
        name: "Fish Aquarium (Medium)",
        price: 2500,
        description: "Medium-sized glass aquarium for home.",
        image: "https://kolifish.com/images/aquarium.jpg",
        category: "Aquarium",
        isActive: true,
      },
      {
        name: "Fish Food (1kg)",
        price: 150,
        description: "Nutritious fish food for all types of fish.",
        image: "https://kolifish.com/images/fish-food.jpg",
        category: "Fish Food",
        isActive: true,
      },
      {
        name: "Fish Medicine",
        price: 100,
        description: "General medicine for fish health.",
        image: "https://kolifish.com/images/medicine.jpg",
        category: "Medicine",
        isActive: true,
      },
    ];

    // Option A: only insert new ones, avoid duplicates by name
    // (Recommended)
    const existing = await Product.find({}, { name: 1 });
    const existingNames = new Set(existing.map((p) => p.name));

    const toInsert = products.filter((p) => !existingNames.has(p.name));

    if (toInsert.length === 0) {
      return res.json({
        success: true,
        message: "No new products to seed (all already exist).",
        inserted: 0,
      });
    }

    const createdProducts = await Product.insertMany(toInsert);

    res.json({
      success: true,
      message: `${createdProducts.length} products seeded successfully`,
      inserted: createdProducts.length,
      products: createdProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// GET ALL PRODUCTS (Public)
// ============================================

router.get("/", async (req, res) => {
  try {
    const { limit, category, search } = req.query;

    // Base query
    const query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name (case-insensitive)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Safe limit (max 500)
    const safeLimit = Math.min(Number(limit) || 200, 500);

    const products = await Product.find(query)
      .sort({ createdAt: -1, _id: -1 }) // newest first
      .limit(safeLimit);

    res.status(200).json(products);

  } catch (error) {
    console.error("GET /products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products"
    });
  }
});

// ============================================
// GET SINGLE PRODUCT (Public)
// ============================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;