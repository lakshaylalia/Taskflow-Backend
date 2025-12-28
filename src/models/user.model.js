import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "Name is required"],
      minLength: [2, "First name must be at least 2 characters"],
      maxLength: [100, "First name cannot exceed 100 characters"],
    },
    lastName: {
      type: String,
      lowercase: true,
      trim: true,
      minLength: [2, "Last name must be at least 2 characters"],
      maxLength: [100, "Last name cannot exceed 100 characters"],
    },
    fullName: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 8 characters"],
      maxLength: [20, "Password cannot exceed 100 characters"],
      validate: {
        validator: function (value) {
          if (!this.isModified("password")) return true;
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      },
    },

    contactNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      minLength: [
        13,
        "Phone number must be exactly 13 characters (+91xxxxxxxxxx)",
      ],
      maxLength: [
        13,
        "Phone number must be exactly 13 characters (+91xxxxxxxxxx)",
      ],
      validate: {
        validator: function (v) {
          return /^\+91[6-9]\d{9}$/.test(v);
        },
        message:
          "Phone number must be a valid Indian mobile number (+91xxxxxxxxxx)",
      },
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
      unique: true,
    },
    avatarImage: {
      type: String,
      required: true,
      trim: true,
      default: "/images/defaultUserImage.webp",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRY_TIME,
    }
  );
};

export const User = mongoose.model("User", userSchema);
