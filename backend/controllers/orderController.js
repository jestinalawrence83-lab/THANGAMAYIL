
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export async function createOrder(req, res) {
  try {
    const { items, shippingAddress, paymentMethod = "COD" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) => !String(shippingAddress[field] || "").trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete shipping details.",
      });
    }

    if (!["COD", "RAZORPAY"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = item.product || item.productId || item._id;
      const quantity = Number(item.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity.",
        });
      }

      const product = await Product.findById(productId);

      if (!product || product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is unavailable.",
        });
      }

      if (
        Number.isFinite(Number(product.stock)) &&
        Number(product.stock) < quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `${product.name || product.title} has insufficient stock.`,
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product price.",
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name || product.title || "Jewellery",
        image: product.image || product.imageUrl || "",
        price,
        quantity,
      });

      subtotal += price * quantity;
    }

    const shippingFee = subtotal >= 2000 ? 0 : 100;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      totalAmount: subtotal + shippingFee,
      paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to place order.",
    });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name title image imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your orders.",
    });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.product", "name title image imageUrl");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    console.error("Get order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order.",
    });
  }
}
