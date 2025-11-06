// IMPORTS
require("dotenv").config();
const express = require("express");
const kickitApp = express();
const mongoose = require("mongoose");
const cors = require("cors");
const port = process.env.PORT ? process.env.PORT : "1986";

// IMPORT ROUTERS
const kicksRouter = require("./controllers/KickController");

// CONNECT TO MONGOOSE
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// MIDDLEWARE
kickitApp.use(cors());
kickitApp.use(express.json());

// ROUTES
kickitApp.use("/kicks", kicksRouter);

// START SERVER AND LISTEN ON PORT 3000
kickitApp.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
