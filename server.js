require("dotenv").config();
const express = require("express");
const kickitApp = express();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const port = process.env.PORT ? process.env.PORT : "1986";

// Trust Heroku's proxy
if (process.env.NODE_ENV === "production") {
  kickitApp.set("trust proxy", 1);
}

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://kickit-app.netlify.app"]
    : ["http://localhost:5173"];

const authRouter = require("./controllers/AuthController");
const userRouter = require("./controllers/UserController");
const kickRouter = require("./controllers/KickController");

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`✅ Connected to MongoDB ${mongoose.connection.name}`);
    console.log(`📊 Database: ${process.env.MONGODB_URI}`);
  } else {
    console.log("Database connected");
  }
});

// Apply Helmet security headers in production
if (process.env.NODE_ENV === "production") {
  kickitApp.use(helmet());
}

kickitApp.use(
  cors({
    origin: allowedOrigins,
  })
);
kickitApp.use(express.json());

kickitApp.use("/auth", authRouter);
kickitApp.use("/users", userRouter);
kickitApp.use("/kicks", kickRouter);

kickitApp.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
