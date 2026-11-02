
import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

const SHIPPING_FEE = Number(process.env.SHIPPING_FEE || 0);

// Validate shipping address
function validateAddress(address) {
  const fields = [
    "fullName",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
  ];

  for (const field of fields) {
    if (!address?.[field] || !String(address[field]).trim()) {
      throw new Error(`Please enter shipping ${field}`);
    }
  }

  return Object.fromEntries(
    fields.map((field) => [field, String(address[field]).trim()])
  );
}

// Validate products and prepare order items
async function prepareItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty");
  }

  const result = [];

  for (const item of items) {
    const productId =
      item.productId ||
      item.product?._id ||
      item.product ||
      item._id;

    const quantity = Number(item.quantity);

    if (!mongoose.isValidObjectId(productId)) {
      throw new Error("Invalid product in cart");
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      throw new Error("Invalid product quantity");
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      throw new Error("A product in your cart is unavailable");
    }

    if (Number(product.stock) < quantity) {
      throw new Error(`${product.name} has insufficient stock`);
    }

    result.push({
      product: product._id,
      name: product.name,
      image:
        product.image ||
        product.imageUrl ||
        product.images?.[0] ||
        "",
      price: Number(product.price),
      quantity,
    });
  }

  return result;
}

// Calculate order totals using database prices
function calculateTotals(items) {
  const subtotal = Number(
    items
      .reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      .toFixed(2)
  );

  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0;

  return {
    subtotal,
    shippingFee,
    totalAmount: Number(
      (subtotal + shippingFee).toFixed(2)
    ),
  };
}

// ==========================================
// 1. CASH ON DELIVERY
// POST /api/orders
// ==========================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    if (paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Use Razorpay payment for online orders",
      });
    }

    const address = validateAddress(shippingAddress);
    const preparedItems = await prepareItems(items);
    const totals = calculateTotals(preparedItems);

    const order = await Order.create({
      user: req.user._id,
      items: preparedItems,
      shippingAddress: address,
      ...totals,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("COD ORDER ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to place order",
    });
  }
});

// ==========================================
// 2. RAZORPAY CREATE ORDER
// POST /api/orders/razorpay/create-order
// ==========================================

router.post(
  "/razorpay/create-order",
  protect,
  async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({
          success: false,
          message: "Razorpay keys are missing in backend .env",
        });
      }

      const address = validateAddress(
        req.body.shippingAddress
      );

      const preparedItems = await prepareItems(
        req.body.items
      );

      const totals = calculateTotals(preparedItems);

      const amountInPaise = Math.round(
        totals.totalAmount * 100
      );

      if (
        !Number.isSafeInteger(amountInPaise) ||
        amountInPaise < 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Order amount must be at least ₹1",
        });
      }

      const gatewayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `tm_${Date.now()}`,
        notes: {
          userId: String(req.user._id),
        },
      });

      return res.status(200).json({
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: gatewayOrder.id,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        items: preparedItems,
        shippingAddress: address,
        ...totals,
      });
    } catch (error) {
      console.error(
        "RAZORPAY CREATE ORDER ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.error?.description ||
          error.description ||
          error.message ||
          "Unable to create Razorpay order",
      });
    }
  }
);

// ==========================================
// 3. RAZORPAY PAYMENT VERIFICATION
// POST /api/orders/razorpay/verify
// ==========================================

router.post(
  "/razorpay/verify",
  protect,
  async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({
          success: false,
          message: "Razorpay is not configured",
        });
      }

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        items,
        shippingAddress,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment details are incomplete",
        });
      }

      // Prevent duplicate orders for the same payment
      const existingOrder = await Order.findOne({
        paymentId: razorpay_payment_id,
      });

      if (existingOrder) {
        if (
          String(existingOrder.user) !==
          String(req.user._id)
        ) {
          return res.status(403).json({
            success: false,
            message: "This payment belongs to another account",
          });
        }

        return res.json({
          success: true,
          message: "Payment already verified",
          order: existingOrder,
        });
      }

      // Verify Razorpay signature
      const expectedSignature = crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

      const received = Buffer.from(
        razorpay_signature,
        "hex"
      );

      const expected = Buffer.from(
        expectedSignature,
        "hex"
      );

      if (
        received.length !== expected.length ||
        !crypto.timingSafeEqual(received, expected)
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment signature verification failed",
        });
      }

      // Fetch Razorpay order
      const gatewayOrder = await razorpay.orders.fetch(
        razorpay_order_id
      );

      if (
        gatewayOrder.notes?.userId !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Payment order does not belong to this account",
        });
      }

      // Fetch payment details
      const payment = await razorpay.payments.fetch(
        razorpay_payment_id
      );

      if (
        payment.order_id !== razorpay_order_id ||
        payment.status !== "captured" ||
        payment.amount !== gatewayOrder.amount ||
        payment.currency !== "INR"
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment is not captured successfully",
        });
      }

      const address = validateAddress(shippingAddress);
      const preparedItems = await prepareItems(items);
      const totals = calculateTotals(preparedItems);

      if (
        Math.round(totals.totalAmount * 100) !==
        gatewayOrder.amount
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment amount does not match the current cart total",
        });
      }

      const order = await Order.create({
        user: req.user._id,
        items: preparedItems,
        shippingAddress: address,
        ...totals,
        paymentMethod: "RAZORPAY",
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        paymentId: razorpay_payment_id,
      });

      return res.status(201).json({
        success: true,
        message: "Payment verified and order placed successfully",
        order,
      });
    } catch (error) {
      console.error(
        "RAZORPAY VERIFY ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.error?.description ||
          error.description ||
          error.message ||
          "Payment verification failed",
      });
    }
  }
);

// ==========================================
// 4. CUSTOMER ORDER HISTORY
// GET /api/orders/my-orders
// ==========================================

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate(
        "items.product",
        "name image imageUrl"
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load order history",
    });
  }
});

// ==========================================
// 5. CUSTOMER ORDER DETAILS
// GET /api/orders/:id
// ==========================================

router.get("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate(
      "items.product",
      "name image imageUrl"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("ORDER DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load order",
    });
  }
});

export default router;
