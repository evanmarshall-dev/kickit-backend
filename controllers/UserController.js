const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

// GET /users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "username email");

    res.json(users);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET /users/:userId
router.get("/:userId", async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ err: "Unauthorized" });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ err: "User not found." });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
