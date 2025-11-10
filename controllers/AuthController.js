const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const saltRounds = 12;

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
      return res.status(409).json({ err: "Username already taken." });
    }

    // Check for required fields
    if (
      !req.body.username ||
      !req.body.password ||
      !req.body.name ||
      !req.body.email
    ) {
      return res
        .status(400)
        .json({ err: "Username, password, name, and email are required." });
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
    res.status(500).json({ err: err.message });
  }
});

// POST /auth/signin
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(401).json({ err: "Invalid credentials." });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.hashedPassword
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ err: "Invalid credentials." });
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
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
