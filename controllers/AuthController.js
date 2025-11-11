const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const saltRounds = 12;

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    // Check for required fields first
    if (
      !req.body.username ||
      !req.body.password ||
      !req.body.name ||
      !req.body.email
    ) {
      const missingFields = [];
      if (!req.body.username) missingFields.push("username");
      if (!req.body.password) missingFields.push("password");
      if (!req.body.name) missingFields.push("name");
      if (!req.body.email) missingFields.push("email");

      return res.status(400).json({
        err: `Missing required fields: ${missingFields.join(
          ", "
        )}. Please fill in all required information.`,
      });
    }

    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
      return res
        .status(409)
        .json({
          err: "This username is already taken. Please choose a different username.",
        });
    }

    const user = await User.create({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, saltRounds),
    });

    const payload = { username: user.username, _id: user._id };

    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);

    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        err: `This ${field} is already registered. Please use a different ${field} or sign in.`,
      });
    }

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ err: messages.join(". ") });
    }

    res
      .status(500)
      .json({ err: "An error occurred during sign up. Please try again." });
  }
});

// POST /auth/signin
router.post("/signin", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        err: "Please provide both username and password to sign in.",
      });
    }

    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res
        .status(401)
        .json({
          err: "Invalid username or password. Please check your credentials and try again.",
        });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.hashedPassword
    );

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({
          err: "Invalid username or password. Please check your credentials and try again.",
        });
    }

    const payload = { username: user.username, _id: user._id };

    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res
      .status(500)
      .json({ err: "An error occurred during sign in. Please try again." });
  }
});

module.exports = router;
