
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Frontend status -> Order.js model status
const orderStatusMap = {
  pending: "PLACED",
  placed: "PLACED",
  processing: "PROCESSING",
  confirmed: "CONFIRMED",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  canceled: "CANCELLED",
};

function sendError(res, error, fallback) {
  console.error(fallback, error);

  return res.status(500).json({
    success: false,
    message: fallback,
    error: error.message,
  });
}

// Dashboard statistics
export async function getDashboardStats(req, res) {
  try {
    const [totalUsers, totalProducts, totalOrders, allOrders] =
      await Promise.all([
        User.countDocuments({ role: { $ne: "admin" } }),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.find().select(
          "totalAmount total amount orderStatus status paymentStatus"
        ),
      ]);

    const totalRevenue = allOrders.reduce((sum, order) => {
      const status = String(
        order.orderStatus || order.status || ""
      ).toLowerCase();

      const payment = String(order.paymentStatus || "").toLowerCase();

      if (["cancelled", "canceled", "failed"].includes(status)) {
        return sum;
      }

      if (
        payment &&
        !["paid", "completed", "success", "succeeded"].includes(payment)
      ) {
        return sum;
      }

      return (
        sum +
        Number(order.totalAmount ?? order.total ?? order.amount ?? 0)
      );
    }, 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers: totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to load dashboard statistics."
    );
  }
}

// Get all orders
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return sendError(res, error, "Unable to load orders.");
  }
}

// Update order status
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body || {};

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    // Accept Pending, pending, PROCESSING, etc.
    const requestedStatus = String(orderStatus || "")
      .trim()
      .toLowerCase();

    const mappedStatus = orderStatusMap[requestedStatus];

    if (!mappedStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
        allowedStatuses: [
          "Pending",
          "Processing",
          "Confirmed",
          "Shipped",
          "Delivered",
          "Cancelled",
        ],
      });
    }

    // Find order
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Save status in the exact format required by Order.js
    order.orderStatus = mappedStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update order status.",
      error: error.message,
    });
  }
}

// Get admin products
export async function getAdminProducts(req, res) {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return sendError(res, error, "Unable to load products.");
  }
}

// Create product
export async function createAdminProduct(req, res) {
  try {
    const body = { ...req.body };

    if (!body.name && body.title) {
      body.name = body.title;
    }

    if (!body.image && body.imageUrl) {
      body.image = body.imageUrl;
    }

    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;

    const product = await Product.create(body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error, "Unable to create product.");
  }
}

// Update product
export async function updateAdminProduct(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const body = { ...req.body };

    if (!body.name && body.title) {
      body.name = body.title;
    }

    if (!body.image && body.imageUrl) {
      body.image = body.imageUrl;
    }

    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.role;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error, "Unable to update product.");
  }
}

// Delete product
export async function deleteAdminProduct(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error, "Unable to delete product.");
  }
}

// Get admin customers
export async function getAdminCustomers(req, res) {
  try {
    const customers = await User.find({
      role: { $ne: "admin" },
    })
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(2000)
      .lean();

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    return sendError(res, error, "Unable to load customers.");
  }
}
