import { Router } from "express";

const router = Router();

// Used to create and get all projects
router.route("/").get(getAllProjects).post(createProject);

// use to get all members of a project and add new members
router.route("/:projectId/members").get(getProjectMembers).post(addMember);

// Used to get all projects of a user
router.route("/user/:userId").get(getUserProjects);

// Used to get, edit and delete a project by id
router
  .route("/:projectId")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

// Used to update members role and remove members from a project
router
  .route("/:projectId/members/:userId")
  .put(updateMemberRole)
  .delete(removeMember);

export default router;
