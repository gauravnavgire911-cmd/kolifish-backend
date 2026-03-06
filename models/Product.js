const mongoose = require("mongoose");

const nutritionSchema = new mongoose.Schema(
  {
    protein: { type: String, default: "" },
    fat: { type: String, default: "" },
    calories: { type: String, default: "" },
    carbs: { type: String, default: "" },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    altName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Alt name cannot exceed 100 characters"],
    },

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
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    image: {
      type: String,
      default: "https://via.placeholder.com/900x650?text=KoliFish",
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Saltwater Fish", "Freshwater Fish", "Shellfish", "Dry Fish"],
    },

    subcategory: {
      type: String,
      default: "",
      trim: true,
    },

    cuttingOptions: {
      type: [String],
      default: [],
    },

    nutrition: {
      type: nutritionSchema,
      default: () => ({}),
    },

    nutritionNote: {
      type: String,
      default: "Approximate values per 100g.",
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    origin: {
      type: String,
      default: "",
      trim: true,
    },

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

    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for search and filtering
productSchema.index({ name: "text", altName: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });

// Normalize and clean data before save
productSchema.pre("save", function (next) {
  // Keep pricePerKg aligned with price
  this.pricePerKg = this.price;

  // Clean images: trim, remove empty, remove duplicates
  if (Array.isArray(this.images)) {
    const cleanedImages = this.images
      .map((u) => (typeof u === "string" ? u.trim() : ""))
      .filter(Boolean);

    this.images = Array.from(new Set(cleanedImages));
  } else {
    this.images = [];
  }

  // Clean cuttingOptions
  if (Array.isArray(this.cuttingOptions)) {
    const cleanedCuts = this.cuttingOptions
      .map((c) => (typeof c === "string" ? c.trim() : ""))
      .filter(Boolean);

    this.cuttingOptions = Array.from(new Set(cleanedCuts));
  } else {
    this.cuttingOptions = [];
  }

  // Ensure main image exists inside images array
  if (typeof this.image === "string") {
    this.image = this.image.trim();
  }

  const hasRealMainImage =
    this.image &&
    typeof this.image === "string" &&
    !this.image.includes("via.placeholder.com");

  if (hasRealMainImage) {
    if (!this.images.includes(this.image)) {
      this.images.unshift(this.image);
    }
  } else if (this.images.length > 0) {
    this.image = this.images[0];
  }

  // Trim text fields
  if (typeof this.altName === "string") this.altName = this.altName.trim();
  if (typeof this.subcategory === "string") this.subcategory = this.subcategory.trim();
  if (typeof this.brand === "string") this.brand = this.brand.trim();
  if (typeof this.origin === "string") this.origin = this.origin.trim();
  if (typeof this.nutritionNote === "string") this.nutritionNote = this.nutritionNote.trim();

  next();
});

module.exports = mongoose.model("Product", productSchema);