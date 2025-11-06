const express = require("express");
const Kick = require("../models/Kick");
const router = express.Router();
// ? const verifyToken = require("../middleware/verifyToken");

// APPLY MIDDLEWARE TO VERIFY JWT FOR ALL ROUTES IN THIS CONTROLLER
// ? router.use(verifyToken);

// CREATE A NEW KICK
router.post("/", async (req, res) => {
  try {
    // Basic server-side required field checks to give clearer errors to clients
    const { title, description, category } = req.body || {};

    if (!title || !description || !category) {
      // Return 400 for missing required fields instead of a generic 500
      return res.status(400).json({
        error: "Missing required fields: title, description, category",
        received: req.body,
      });
    }

    // Optionally attach authenticated user as author (commented placeholder)
    // req.body.author = req.user?._id;

    const newKick = await Kick.create({
      title,
      description,
      category,
      author: req.body.author,
    });
    res.status(201).json(newKick);
  } catch (error) {
    // Log a clearer server-side message
    console.error("Error creating kick:", error);

    // Mongoose validation errors should return 4xx with the validation message
    if (error && error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

// EXPORT ROUTER
module.exports = router;
