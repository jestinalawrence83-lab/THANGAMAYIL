
import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get wishlist
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("wishlist");

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add product to wishlist
router.post("/", protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user.wishlist.some((id) => id.toString() === productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(req.user._id).populate("wishlist");

    res.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove product from wishlist
router.delete("/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("wishlist");

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
