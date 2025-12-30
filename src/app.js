import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import passport from "passport";

import "./config/passport.js";

// routes import
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export { app };
