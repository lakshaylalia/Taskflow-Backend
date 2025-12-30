import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error : ", error);
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log(`app is running on port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed !!! ", err);
  });
