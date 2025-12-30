import passport from "passport";
import { Router } from "express";
import { loginEmail, registerEmail, googleCallback } from "../controllers/auth.controller.js";

const router = Router();

router.route("/").get((req, res) => {
  res.send("<a href='/api/v1/auth/google'>Google</a>");
});
router.route("/login").post(loginEmail);
router.route("/register").post(registerEmail);

router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router.route("/google/callback").get(
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
 googleCallback
);

// router.route("/github").get()

export default router;
