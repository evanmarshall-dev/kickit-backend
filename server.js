// IMPORTS
require("dotenv").config();
const express = require("express");
const kickitApp = express();
const mongoose = require("mongoose");
const cors = require("cors");
const port = process.env.PORT ? process.env.PORT : "1986";

// IMPORT ROUTERS
const authRouter = require("./controllers/AuthController");
const userRouter = require("./controllers/UserController");
const kickRouter = require("./controllers/KickController");

// CONNECT TO MONGOOSE
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// MIDDLEWARE
kickitApp.use(
  cors({
    origin: "https://kickit-app.netlify.app",
  })
);
kickitApp.use(express.json());

// ROUTES
kickitApp.use("/auth", authRouter);
kickitApp.use("/users", userRouter);
kickitApp.use("/kicks", kickRouter);

// START SERVER AND LISTEN ON PORT 3000
kickitApp.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
