const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

/*
============================================
PRODUCTS SEED
============================================
- Clean reset
- Multiple images support
- Cutting options
- Nutrition values
- Fry Cut / Boneless options added where suitable
*/

router.post("/seed", async (req, res) => {
  try {
    const products = [
      // ============================================
      // SALTWATER
      // ============================================
      {
        name: "Pomfret (Paplet)",
        price: 850,
        category: "Saltwater Fish",
        description:
          "Fresh Pomfret (Paplet) sourced from coastal waters. Cleaned and packed hygienically.",
        image:
          "https://res.cloudinary.com/drlcmjc8n/image/upload/f_auto,q_auto/v1772648431/paplet1_gl4d43.jpg",
        images: [
          "https://res.cloudinary.com/drlcmjc8n/image/upload/f_auto,q_auto/v1772648431/paplet1_gl4d43.jpg",
          "https://res.cloudinary.com/drlcmjc8n/image/upload/f_auto,q_auto/v1772655003/paplet4_hhrrjk.jpg",
          "https://res.cloudinary.com/drlcmjc8n/image/upload/f_auto,q_auto/v1772655001/paplet2_ufc5es.jpg",
          "https://res.cloudinary.com/drlcmjc8n/image/upload/f_auto,q_auto/v1772655008/paplet3_x56mzk.jpg",
        ],
        cuttingOptions: ["Whole", "Cleaned Whole", "Curry Cut", "Fry Cut", "Fillet", "Boneless"],
        nutrition: {
          protein: "18g",
          fat: "4g",
          calories: "117 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Black Pomfret (Halwa)",
        price: 520,
        category: "Saltwater Fish",
        description: "Black pomfret (Halwa) — rich taste, great for fry and curry.",
        image: "https://kolifish.com/images/black-pomfret.jpg",
        images: [
          "https://kolifish.com/images/black-pomfret.jpg",
          "https://kolifish.com/images/black-pomfret.jpg",
          "https://kolifish.com/images/black-pomfret.jpg",
        ],
        cuttingOptions: ["Whole", "Cleaned Whole", "Curry Cut", "Fry Cut", "Fillet"],
        nutrition: {
          protein: "17g",
          fat: "5g",
          calories: "124 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Mackerel (Bangda)",
        price: 240,
        category: "Saltwater Fish",
        description: "Mumbai favorite Bangda — best for fry, rava fry and curry.",
        image: "https://kolifish.com/images/mackerel.jpg",
        images: [
          "https://kolifish.com/images/mackerel.jpg",
          "https://kolifish.com/images/mackerel.jpg",
          "https://kolifish.com/images/mackerel.jpg",
        ],
        cuttingOptions: ["Whole", "Cleaned Whole", "Curry Cut", "Fry Cut"],
        nutrition: {
          protein: "19g",
          fat: "13g",
          calories: "205 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Sardine (Tarli)",
        price: 220,
        category: "Saltwater Fish",
        description: "Tarli — soft, flavorful, ideal for spicy curry and fry.",
        image: "https://kolifish.com/images/sardine.jpg",
        images: [
          "https://kolifish.com/images/sardine.jpg",
          "https://kolifish.com/images/sardine.jpg",
          "https://kolifish.com/images/sardine.jpg",
        ],
        cuttingOptions: ["Whole", "Cleaned Whole", "Curry Cut", "Fry Cut"],
        nutrition: {
          protein: "20g",
          fat: "10g",
          calories: "185 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Surmai (King Fish)",
        price: 720,
        category: "Saltwater Fish",
        description: "Surmai steaks — firm texture, premium taste.",
        image: "https://kolifish.com/images/surmai.jpg",
        images: [
          "https://kolifish.com/images/surmai.jpg",
          "https://kolifish.com/images/surmai.jpg",
          "https://kolifish.com/images/surmai.jpg",
        ],
        cuttingOptions: ["Whole", "Steak Cut", "Curry Cut", "Fry Cut", "Fillet", "Boneless"],
        nutrition: {
          protein: "21g",
          fat: "6g",
          calories: "134 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Rawas (Indian Salmon)",
        price: 780,
        category: "Saltwater Fish",
        description: "Rawas — soft & juicy, perfect for tawa fry.",
        image: "https://kolifish.com/images/rawas.jpg",
        images: [
          "https://kolifish.com/images/rawas.jpg",
          "https://kolifish.com/images/rawas.jpg",
          "https://kolifish.com/images/rawas.jpg",
        ],
        cuttingOptions: ["Whole", "Steak Cut", "Curry Cut", "Fry Cut", "Fillet", "Boneless"],
        nutrition: {
          protein: "20g",
          fat: "8g",
          calories: "155 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Bombay Duck (Bombil)",
        price: 220,
        category: "Saltwater Fish",
        description: "Bombil — crispy fry favorite.",
        image: "https://kolifish.com/images/bombay-duck.jpg",
        images: [
          "https://kolifish.com/images/bombay-duck.jpg",
          "https://kolifish.com/images/bombay-duck.jpg",
        ],
        cuttingOptions: ["Whole", "Cleaned Whole", "Fry Cut"],
        nutrition: {
          protein: "16g",
          fat: "3g",
          calories: "96 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Tuna (Kupa)",
        price: 420,
        category: "Saltwater Fish",
        description: "Kupa — meaty fish ideal for curry.",
        image: "https://kolifish.com/images/tuna.jpg",
        images: [
          "https://kolifish.com/images/tuna.jpg",
          "https://kolifish.com/images/tuna.jpg",
        ],
        cuttingOptions: ["Whole", "Steak Cut", "Curry Cut", "Fry Cut", "Fillet", "Boneless"],
        nutrition: {
          protein: "23g",
          fat: "5g",
          calories: "132 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Squid (Kalmar)",
        price: 520,
        category: "Shellfish",
        description: "Kalmar — tender rings perfect for fry.",
        image: "https://kolifish.com/images/squid.jpg",
        images: [
          "https://kolifish.com/images/squid.jpg",
          "https://kolifish.com/images/squid.jpg",
        ],
        cuttingOptions: ["Whole Cleaned", "Rings", "Pieces", "Fry Cut"],
        nutrition: {
          protein: "16g",
          fat: "1g",
          calories: "92 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Octopus (Bebdo)",
        price: 650,
        category: "Shellfish",
        description: "Bebdo — cleaned octopus for slow cooking.",
        image: "https://kolifish.com/images/octopus.jpg",
        images: [
          "https://kolifish.com/images/octopus.jpg",
          "https://kolifish.com/images/octopus.jpg",
        ],
        cuttingOptions: ["Whole Cleaned", "Pieces"],
        nutrition: {
          protein: "15g",
          fat: "2g",
          calories: "82 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      // ============================================
      // SHELLFISH
      // ============================================
      {
        name: "Prawns (Kolambi) — Medium",
        price: 540,
        category: "Shellfish",
        description: "Medium Kolambi — perfect for curry and biryani.",
        image: "https://kolifish.com/images/prawns-medium.jpg",
        images: [
          "https://kolifish.com/images/prawns-medium.jpg",
          "https://kolifish.com/images/prawns-medium.jpg",
        ],
        cuttingOptions: ["Whole", "Cleaned", "Peeled", "Peeled & Deveined", "Boneless"],
        nutrition: {
          protein: "24g",
          fat: "1g",
          calories: "99 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Prawns (Kolambi) — Large",
        price: 780,
        category: "Shellfish",
        description: "Large Kolambi — premium size prawns.",
        image: "https://kolifish.com/images/prawns-large.jpg",
        images: [
          "https://kolifish.com/images/prawns-large.jpg",
          "https://kolifish.com/images/prawns-large.jpg",
        ],
        cuttingOptions: ["Whole", "Cleaned", "Peeled", "Peeled & Deveined", "Boneless"],
        nutrition: {
          protein: "24g",
          fat: "1g",
          calories: "99 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Crab (Chimbori)",
        price: 480,
        category: "Shellfish",
        description: "Chimbori — meaty crab perfect for spicy curry.",
        image: "https://kolifish.com/images/crab.jpg",
        images: [
          "https://kolifish.com/images/crab.jpg",
          "https://kolifish.com/images/crab.jpg",
        ],
        cuttingOptions: ["Whole", "Cleaned & Cut"],
        nutrition: {
          protein: "18g",
          fat: "1g",
          calories: "87 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Clams (Tisrya)",
        price: 260,
        category: "Shellfish",
        description: "Tisrya — traditional coastal seafood.",
        image: "https://kolifish.com/images/clams.jpg",
        images: [
          "https://kolifish.com/images/clams.jpg",
          "https://kolifish.com/images/clams.jpg",
        ],
        cuttingOptions: ["Cleaned"],
        nutrition: {
          protein: "14g",
          fat: "1g",
          calories: "74 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Mussels (Khube)",
        price: 320,
        category: "Shellfish",
        description: "Khube — cleaned mussels for coconut curries.",
        image: "https://kolifish.com/images/mussels.jpg",
        images: [
          "https://kolifish.com/images/mussels.jpg",
          "https://kolifish.com/images/mussels.jpg",
        ],
        cuttingOptions: ["Cleaned"],
        nutrition: {
          protein: "18g",
          fat: "4g",
          calories: "119 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      // ============================================
      // FRESHWATER
      // ============================================
      {
        name: "Rohu (Rui)",
        price: 180,
        category: "Freshwater Fish",
        description: "Classic freshwater fish for curry.",
        image: "https://kolifish.com/images/rohu.jpg",
        images: [
          "https://kolifish.com/images/rohu.jpg",
          "https://kolifish.com/images/rohu.jpg",
        ],
        cuttingOptions: ["Whole", "Curry Cut", "Steak Cut", "Fry Cut"],
        nutrition: {
          protein: "17g",
          fat: "6g",
          calories: "128 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Catla (Katla)",
        price: 190,
        category: "Freshwater Fish",
        description: "Katla — thick cuts ideal for meals.",
        image: "https://kolifish.com/images/catla.jpg",
        images: [
          "https://kolifish.com/images/catla.jpg",
          "https://kolifish.com/images/catla.jpg",
        ],
        cuttingOptions: ["Whole", "Curry Cut", "Steak Cut", "Fry Cut"],
        nutrition: {
          protein: "18g",
          fat: "5g",
          calories: "122 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Tilapia",
        price: 170,
        category: "Freshwater Fish",
        description: "Mild fish perfect for fry.",
        image: "https://kolifish.com/images/tilapia.jpg",
        images: [
          "https://kolifish.com/images/tilapia.jpg",
          "https://kolifish.com/images/tilapia.jpg",
        ],
        cuttingOptions: ["Whole", "Curry Cut", "Fry Cut", "Fillet", "Boneless"],
        nutrition: {
          protein: "20g",
          fat: "2g",
          calories: "96 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Pangasius (Basa)",
        price: 210,
        category: "Freshwater Fish",
        description: "Basa — boneless fillet fish.",
        image: "https://kolifish.com/images/basa.jpg",
        images: [
          "https://kolifish.com/images/basa.jpg",
          "https://kolifish.com/images/basa.jpg",
        ],
        cuttingOptions: ["Fillet", "Cubes", "Fry Cut", "Boneless"],
        nutrition: {
          protein: "15g",
          fat: "4g",
          calories: "90 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },

      {
        name: "Murrel (Gavti / Shevto)",
        price: 520,
        category: "Freshwater Fish",
        description: "Premium freshwater Murrel.",
        image: "https://kolifish.com/images/murrel.jpg",
        images: [
          "https://kolifish.com/images/murrel.jpg",
          "https://kolifish.com/images/murrel.jpg",
        ],
        cuttingOptions: ["Whole", "Curry Cut", "Fry Cut", "Fillet", "Boneless"],
        nutrition: {
          protein: "19g",
          fat: "4g",
          calories: "110 kcal",
        },
        nutritionNote: "Approximate values per 100g.",
      },
    ];

    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);

    res.json({
      message: "Products seeded successfully",
      count: inserted.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Seed failed" });
  }
});

module.exports = router;
