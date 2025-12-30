import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ProjectMember } from "../models/projectMember.model";
import { Project } from "../models/projects.model";
import { User } from "../models/user.model";

export const getAllProjects = asyncHandler(async (req, res) => {
  const memberships = await ProjectMember.find({
    userId: req.user._id,
  }).populate("projectId");

  const projects = memberships.map((m) => m.projectId);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const members = await ProjectMember.find({ projectId }).populate(
    "userId",
    "name email"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, members, "Members fetched successfully"));
});

export const addMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role = "member" } = req.body;

  const allowedRoles = ["admin", "member"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const exists = await ProjectMember.findOne({ projectId, userId });
  if (exists) {
    throw new ApiError(400, "User already a project member");
  }

  const member = await ProjectMember.create({
    projectId,
    userId,
    role,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, member, "Member added successfully"));
});

export const getUserProjects = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const memberships = await ProjectMember.find({ userId }).populate(
    "projectId"
  );

  const projects = memberships.map((m) => m.projectId);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "User projects fetched"));
});

export const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const isMember = await ProjectMember.findOne({
    projectId,
    userId: req.user._id,
  });

  if (!isMember) {
    throw new ApiError(403, "Access denied");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  if (!projectId) {
    throw new ApiError(400, "Project id is required");
  }

  const projectMemberDetails = await ProjectMember.findOne({
    projectId,
    userId,
  });

  if (!projectMemberDetails) {
    throw new ApiError(404, "Project member not found");
  }

  if (!["admin", "owner"].includes(projectMemberDetails.role)) {
    throw new ApiError(403, "Only admin or owner can update project");
  }

  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      ...(name && { name }),
      ...(description && { description }),
    },
    { new: true }
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  await Project.findByIdAndDelete(projectId);
  await ProjectMember.deleteMany({ projectId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const allowedRoles = ["admin", "member"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const projectMember = await ProjectMember.findOne({
    projectId,
    userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  if (projectMember.role === "owner") {
    throw new ApiError(400, "Owner role cannot be changed");
  }

  projectMember.role = role;
  await projectMember.save();

  return res
    .status(200)
    .json(new ApiResponse(200, projectMember, "Role updated successfully"));
});

export const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const member = await ProjectMember.findOne({ projectId, userId });

  if (!member) {
    throw new ApiError(404, "Project member not found");
  }

  if (member.role === "owner") {
    throw new ApiError(400, "Owner cannot be removed");
  }

  await member.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed successfully"));
});
