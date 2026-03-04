const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

/*
============================================
PRODUCTS SEED
============================================
- Clean reset (removes old products)
- Seeds popular seafood for Mumbai/Raigad/Pune/Nashik
- Automatically sets pricePerKg
- Ensures schema fields exist
*/

router.post("/seed", async (req, res) => {
  try {

    const products = [

      // SALTWATER
      {
        name: "Pomfret (Paplet)",
        price: 650,
        description: "Premium white pomfret — delicate, flaky, restaurant quality.",
        image: "https://res.cloudinary.com/drlcmjc8n/image/upload/v1772648431/paplet1_gl4d43.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Black Pomfret (Halwa)",
        price: 520,
        description: "Black pomfret (Halwa) — rich taste, great for fry and curry.",
        image: "https://kolifish.com/images/black-pomfret.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Mackerel (Bangda)",
        price: 240,
        description: "Mumbai favorite Bangda — best for fry, rava fry and curry.",
        image: "https://kolifish.com/images/mackerel.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Sardine (Tarli)",
        price: 220,
        description: "Tarli — soft, flavorful, ideal for spicy curry and fry.",
        image: "https://kolifish.com/images/sardine.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Surmai (King Fish)",
        price: 720,
        description: "Surmai steaks — firm texture, premium taste.",
        image: "https://kolifish.com/images/surmai.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Rawas (Indian Salmon)",
        price: 780,
        description: "Rawas — soft & juicy, perfect for tawa fry.",
        image: "https://kolifish.com/images/rawas.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Bombay Duck (Bombil)",
        price: 220,
        description: "Bombil — crispy fry favorite.",
        image: "https://kolifish.com/images/bombay-duck.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Tuna (Kupa)",
        price: 420,
        description: "Kupa — meaty fish ideal for curry.",
        image: "https://kolifish.com/images/tuna.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Squid (Kalmar)",
        price: 520,
        description: "Kalmar — tender rings perfect for fry.",
        image: "https://kolifish.com/images/squid.jpg",
        category: "Saltwater Fish"
      },
      {
        name: "Octopus (Bebdo)",
        price: 650,
        description: "Bebdo — cleaned octopus for slow cooking.",
        image: "https://kolifish.com/images/octopus.jpg",
        category: "Saltwater Fish"
      },

      // SHELLFISH
      {
        name: "Prawns (Kolambi) — Medium",
        price: 540,
        description: "Medium Kolambi — perfect for curry and biryani.",
        image: "https://kolifish.com/images/prawns-medium.jpg",
        category: "Shellfish"
      },
      {
        name: "Prawns (Kolambi) — Large",
        price: 780,
        description: "Large Kolambi — premium size prawns.",
        image: "https://kolifish.com/images/prawns-large.jpg",
        category: "Shellfish"
      },
      {
        name: "Crab (Chimbori)",
        price: 480,
        description: "Chimbori — meaty crab perfect for spicy curry.",
        image: "https://kolifish.com/images/crab.jpg",
        category: "Shellfish"
      },
      {
        name: "Clams (Tisrya)",
        price: 260,
        description: "Tisrya — traditional coastal seafood.",
        image: "https://kolifish.com/images/clams.jpg",
        category: "Shellfish"
      },
      {
        name: "Mussels (Khube)",
        price: 320,
        description: "Khube — cleaned mussels for coconut curries.",
        image: "https://kolifish.com/images/mussels.jpg",
        category: "Shellfish"
      },

      // FRESHWATER
      {
        name: "Rohu (Rui)",
        price: 180,
        description: "Classic freshwater fish for curry.",
        image: "https://kolifish.com/images/rohu.jpg",
        category: "Freshwater Fish"
      },
      {
        name: "Catla (Katla)",
        price: 190,
        description: "Katla — thick cuts ideal for meals.",
        image: "https://kolifish.com/images/catla.jpg",
        category: "Freshwater Fish"
      },
      {
        name: "Tilapia",
        price: 170,
        description: "Mild fish perfect for fry.",
        image: "https://kolifish.com/images/tilapia.jpg",
        category: "Freshwater Fish"
      },
      {
        name: "Pangasius (Basa)",
        price: 210,
        description: "Basa — boneless fillet fish.",
        image: "https://kolifish.com/images/basa.jpg",
        category: "Freshwater Fish"
      },
      {
        name: "Murrel (Gavti / Shevto)",
        price: 520,
        description: "Premium freshwater Murrel.",
        image: "https://kolifish.com/images/murrel.jpg",
        category: "Freshwater Fish"
      },

      // DRY FISH
      {
        name: "Dry Fish — Bombay Duck (Sukat Bombil)",
        price: 420,
        description: "Traditional Maharashtrian dried bombil.",
        image: "https://kolifish.com/images/dry-bombay-duck.jpg",
        category: "Dry Fish"
      },
      {
        name: "Dry Fish — Prawns (Sukat Kolambi)",
        price: 520,
        description: "Dried prawns used in chutneys.",
        image: "https://kolifish.com/images/dry-prawns.jpg",
        category: "Dry Fish"
      }

    ];

    // Normalize fields required by schema
    const normalizedProducts = products.map(p => ({
      ...p,
      pricePerKg: p.price,
      unit: "kg",
      stock: 999,
      minOrderQty: 1,
      availability: "in_stock",
      freshness: "Fresh",
      isActive: true
    }));

    // CLEAN RESET
    await Product.deleteMany({});

    const created = await Product.insertMany(normalizedProducts);

    res.json({
      success: true,
      message: `${created.length} products seeded successfully`,
      inserted: created.length,
      products: created
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


/*
============================================
GET ALL PRODUCTS
============================================
*/
router.get("/", async (req, res) => {
  try {

    const { limit, category, search } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const safeLimit = Math.min(Number(limit) || 200, 500);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(safeLimit);

    res.json(products);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching products"
    });
  }
});


/*
============================================
GET SINGLE PRODUCT
============================================
*/
router.get("/:id", async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;