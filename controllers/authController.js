import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { USER_TYPES, ADMIN_VERIFICATION_STATUS } from "../models/User.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      userType,
    });

    // If user is requesting admin privileges, set admin verification to pending
    if (userType === USER_TYPES.ADMIN) {
      user.adminVerification.status = ADMIN_VERIFICATION_STATUS.PENDING;
      user.adminVerification.requestDate = Date.now();
      await user.save();
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        isAdmin: user.isAdmin(),
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (user && (await user.comparePassword(password))) {
      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        isAdmin: user.isAdmin(),
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        adminVerification:
          user.userType === USER_TYPES.ADMIN
            ? user.adminVerification
            : undefined,
        gardenerProfile:
          user.userType === USER_TYPES.GARDENER
            ? user.gardenerProfile
            : undefined,
        supervisorProfile:
          user.userType === USER_TYPES.SUPERVISOR
            ? user.supervisorProfile
            : undefined,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        address: user.address,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

      // Update address if provided
      if (req.body.address) {
        user.address = {
          ...user.address,
          ...req.body.address,
        };
      }

      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      // Update specific profile based on user type
      if (user.userType === USER_TYPES.GARDENER && req.body.gardenerProfile) {
        user.gardenerProfile = {
          ...user.gardenerProfile,
          ...req.body.gardenerProfile,
        };
      } else if (
        user.userType === USER_TYPES.SUPERVISOR &&
        req.body.supervisorProfile
      ) {
        user.supervisorProfile = {
          ...user.supervisorProfile,
          ...req.body.supervisorProfile,
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        userType: updatedUser.userType,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request admin privileges
// @route   PUT /api/users/request-admin
// @access  Private
export const requestAdminPrivileges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already an admin or has a pending request
    if (user.userType === USER_TYPES.ADMIN) {
      if (
        user.adminVerification.status === ADMIN_VERIFICATION_STATUS.APPROVED
      ) {
        return res.status(400).json({ message: "User is already an admin" });
      } else if (
        user.adminVerification.status === ADMIN_VERIFICATION_STATUS.PENDING
      ) {
        return res
          .status(400)
          .json({ message: "Admin request is already pending" });
      }
    }

    // Update user type and admin verification status
    user.userType = USER_TYPES.ADMIN;
    user.adminVerification.status = ADMIN_VERIFICATION_STATUS.PENDING;
    user.adminVerification.requestDate = Date.now();

    await user.save();

    res.json({
      message: "Admin privileges requested successfully",
      status: user.adminVerification.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending admin requests
// @route   GET /api/users/admin-requests
// @access  Private/Admin
export const getAdminRequests = async (req, res) => {
  try {
    const pendingRequests = await User.find({
      userType: USER_TYPES.ADMIN,
      "adminVerification.status": ADMIN_VERIFICATION_STATUS.PENDING,
    }).select("-password");

    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject admin request
// @route   PUT /api/users/admin-requests/:id
// @access  Private/Admin
export const processAdminRequest = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const userId = req.params.id;

    // Validate status
    if (!Object.values(ADMIN_VERIFICATION_STATUS).includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a pending admin request
    if (
      user.userType !== USER_TYPES.ADMIN ||
      user.adminVerification.status !== ADMIN_VERIFICATION_STATUS.PENDING
    ) {
      return res
        .status(400)
        .json({ message: "No pending admin request found for this user" });
    }

    // Update admin verification status
    user.adminVerification.status = status;
    user.adminVerification.verifiedBy = req.user._id;
    user.adminVerification.verificationDate = Date.now();

    // If rejected, add rejection reason
    if (status === ADMIN_VERIFICATION_STATUS.REJECTED) {
      user.adminVerification.rejectionReason =
        rejectionReason || "No reason provided";
      // Revert user type to normal if rejected
      user.userType = USER_TYPES.NORMAL;
    }

    await user.save();

    res.json({
      message: `Admin request ${status}`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        adminVerification: user.adminVerification,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET || "reset_secret",
      { expiresIn: "1h" }
    );

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real application, you would send an email with the reset link
    // For now, we'll just return the token
    res.json({
      message: "Password reset email sent",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/users/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
