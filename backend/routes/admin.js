
import express from "express";
import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminCustomers
} from "../controllers/adminController.js";

const router = express.Router();

// All routes in this file require admin authentication.
router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);

router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

router.get("/customers", getAdminCustomers);

export default router;
