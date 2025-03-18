import mongoose from "mongoose";

// Define user types as constants
export const USER_TYPES = {
  NORMAL: "normal",
  GARDENER: "gardener",
  SUPERVISOR: "supervisor",
  ADMIN: "admin",
};

// Define admin verification status
export const ADMIN_VERIFICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    userType: {
      type: String,
      enum: Object.values(USER_TYPES),
      default: USER_TYPES.NORMAL,
    },
    // Fields for admin verification
    adminVerification: {
      status: {
        type: String,
        enum: Object.values(ADMIN_VERIFICATION_STATUS),
        default: ADMIN_VERIFICATION_STATUS.PENDING,
      },
      requestDate: {
        type: Date,
        default: null,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      verificationDate: {
        type: Date,
        default: null,
      },
      rejectionReason: {
        type: String,
        default: null,
      },
    },

    supervisorProfile: {
      department: {
        type: String,
        default: null,
      },
      managedAreas: [
        {
          type: String,
        },
      ],
      supervisorSince: {
        type: Date,
        default: null,
      },
    },
    // Common fields for all users
    profilePicture: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// // Pre-save middleware to hash password
// userSchema.pre("save", async function (next) {
//   // Only hash the password if it's modified or new
//   if (!this.isModified("password")) return next();

//   try {
//     // Generate salt
//     const salt = await bcrypt.genSalt(10);
//     // Hash password
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Method to compare password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Method to check if user is admin
// userSchema.methods.isAdmin = function () {
//   return (
//     this.userType === USER_TYPES.ADMIN &&
//     this.adminVerification.status === ADMIN_VERIFICATION_STATUS.APPROVED
//   );
// };

// // Method to check if user is supervisor
// userSchema.methods.isSupervisor = function () {
//   return this.userType === USER_TYPES.SUPERVISOR;
// };

// // Method to check if user is gardener
// userSchema.methods.isGardener = function () {
//   return this.userType === USER_TYPES.GARDENER;
// };

// // Method to request admin privileges
// userSchema.methods.requestAdminPrivileges = function () {
//   if (this.userType !== USER_TYPES.ADMIN) {
//     this.userType = USER_TYPES.ADMIN;
//     this.adminVerification.status = ADMIN_VERIFICATION_STATUS.PENDING;
//     this.adminVerification.requestDate = Date.now();
//   }
//   return this;
// };

// // Static method to find all pending admin requests
// userSchema.statics.findPendingAdminRequests = function () {
//   return this.find({
//     userType: USER_TYPES.ADMIN,
//     "adminVerification.status": ADMIN_VERIFICATION_STATUS.PENDING,
//   });
// };

// Create and export the User model
const User = mongoose.model("User", userSchema);
export default User;
