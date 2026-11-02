
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },

    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0, min: 0 },

    image: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    images: { type: [String], default: [] },

    audience: {
      type: String,
      enum: ["Women", "Men", "Kids", "Unisex"],
      default: "Women",
    },

    material: {
      type: String,
      enum: ["Gold", "Silver", "Diamond", "Platinum", "Fashion"],
      default: "Gold",
    },

    category: { type: String, default: "Necklaces" },
    weight: { type: Number, default: 0 },
    purity: { type: String, default: "" },
    makingCharges: { type: Number, default: 0 },
    stoneType: { type: String, default: "None" },
    stock: { type: Number, default: 10, min: 0 },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
