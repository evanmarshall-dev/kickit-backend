require("dotenv").config();
const express = require("express");
const kickitApp = express();
const mongoose = require("mongoose");
const cors = require("cors");
const port = process.env.PORT ? process.env.PORT : "1986";

const authRouter = require("./controllers/AuthController");
const userRouter = require("./controllers/UserController");
const kickRouter = require("./controllers/KickController");

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

kickitApp.use(
  cors({
    origin: ["https://kickit-app.netlify.app", "http://localhost:5173"],
  })
);
kickitApp.use(express.json());

kickitApp.use("/auth", authRouter);
kickitApp.use("/users", userRouter);
kickitApp.use("/kicks", kickRouter);

kickitApp.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
