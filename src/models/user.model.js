import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      lowercase: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },

    lastName: {
      type: String,
      lowercase: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },

    fullName: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email address",
      },
    },

    password: {
      type: String,
      minLength: 6,
      maxLength: 100,
    },

    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatarImage: {
      type: String,
      default: "/images/defaultUserImage.webp",
    },

    contactNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.provider !== "local") return;
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      provider: this.provider,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRY_TIME,
    }
  );
};

export const User = mongoose.model("User", userSchema);
