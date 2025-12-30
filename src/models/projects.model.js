import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      minLength: [3, "Project name must be at least 3 characters long"],
      maxLength: [50, "Project name must be at most 50 characters long"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project owner is required"],
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
