import express from "express";
import * as authController from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected routes
router.get("/profile", protect, authController.getUserProfile);
router.put("/profile", protect, authController.updateUserProfile);
router.put("/request-admin", protect, authController.requestAdminPrivileges);

// Admin routes
router.get("/admin-requests", protect, admin, authController.getAdminRequests);
router.put(
  "/admin-requests/:id",
  protect,
  admin,
  authController.processAdminRequest
);

export default router;
