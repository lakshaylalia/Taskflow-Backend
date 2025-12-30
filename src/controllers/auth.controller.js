import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { options } from "../../constants.js";

export const loginEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const userExists = await User.findOne({ email });
  if (!userExists) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatch = await userExists.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = await userExists.generateAccessToken(userExists);
  if (!token) {
    throw new ApiError(500, "Error generating token");
  }

  const user = await User.findOne(
    { email },
    "firstName lastName email contactNumber employeeId avatarImage"
  );

  return res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, { user, token }, "User login successfully"));
});

export const registerEmail = asyncHandler(async (req, res) => {
  let { firstName, lastName, email, password, contactNumber, employeeId } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !contactNumber ||
    !employeeId
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!contactNumber.length === 10) {
    throw new ApiError(400, "Contact number must be 10 digits");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { employeeId }, { contactNumber }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  const createdUser = await User.create({
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email,
    password,
    contactNumber,
    employeeId,
  });

  const token = await createdUser.generateAccessToken(createdUser);
  if (!token) {
    throw new ApiError(500, "Error generating token");
  }

  const user = await User.findOne(
    { email },
    "firstName lastName email contactNumber employeeId avatarImage"
  );

  return res
    .status(201)
    .cookie("token", token, options)
    .json(new ApiResponse(201, { user, token }, "User created successfully"));
});

export const googleCallback = async (req, res) => {
  const token = jwt.sign(
    {
      _id: req.user._id,
      email: req.user.email,
      provider: req.user.provider,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRY_TIME }
  );

  res.redirect(`${process.env.FRONTEND_URL}/oauth?token=${token}`);
};

export const githubCallback = async (req, res) => {
  const token = jwt.sign(
    {
      _id: req.user._id,
      provider: req.user.provider,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRY_TIME }
  );

  res.redirect(`${process.env.FRONTEND_URL}/oauth?token=${token}`);
};
