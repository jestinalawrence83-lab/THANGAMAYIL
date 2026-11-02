
import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json(products);
  } catch (error) {
    console.error("PRODUCTS FETCH ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// Get one product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("PRODUCT DETAILS ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
