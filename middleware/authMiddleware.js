import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verify token
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin()) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

// Supervisor middleware
export const supervisor = (req, res, next) => {
  if (req.user && (req.user.isAdmin() || req.user.isSupervisor())) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a supervisor" });
  }
};

// Gardener middleware
export const gardener = (req, res, next) => {
  if (
    req.user &&
    (req.user.isAdmin() || req.user.isSupervisor() || req.user.isGardener())
  ) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a gardener" });
  }
};
