
import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get logged-in user's cart
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("cart.product");

    res.json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add product to cart
router.post("/", protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.user._id);
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += amount;
    } else {
      user.cart.push({ product: productId, quantity: amount });
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate("cart.product");

    res.json({
      success: true,
      message: "Product added to cart",
      cart: updatedUser.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update cart item quantity
router.patch("/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    const user = await User.findById(req.user._id);
    const item = user.cart.find(
      (entry) => entry.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    item.quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("cart.product");

    res.json({ success: true, cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove product from cart
router.delete("/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await user.save();

    res.json({
      success: true,
      message: "Product removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ success: true, message: "Cart cleared", cart: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
