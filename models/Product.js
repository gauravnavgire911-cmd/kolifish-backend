const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // Keep price (existing) + add pricePerKg (frontend compatibility)
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    pricePerKg: {
      type: Number,
      default: 0,
      min: [0, "PricePerKg cannot be negative"],
    },

    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    image: {
      type: String,
      default: "/images/placeholder.png",
    },

    images: [{ type: String }],

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Saltwater Fish",
        "Freshwater Fish",
        "Shellfish",
        "Dry Fish",
        "Aquarium",
        "Accessories",
        "Fish Food",
        "Medicine",
      ],
    },

    subcategory: { type: String, default: "" },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    unit: {
      type: String,
      default: "kg",
      enum: ["kg", "piece", "pack", "gram"],
    },

    minOrderQty: {
      type: Number,
      default: 1,
      min: [1, "Min order qty must be at least 1"],
    },

    brand: { type: String, default: "" },
    origin: { type: String, default: "" },

    freshness: {
      type: String,
      enum: ["Fresh", "Frozen", "Dried"],
      default: "Fresh",
    },

    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock", "pre_order"],
      default: "in_stock",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: { type: String, default: "" },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: { type: String, default: "" },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true } // ✅ correct place for timestamps
);

// Indexes for search and filtering
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });

module.exports = mongoose.model("Product", productSchema);