const express = require("express");
const Kick = require("../models/Kick");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

// POST /kicks
router.post("/", async (req, res) => {
  try {
    const { title, description, category, location, targetDate, status } =
      req.body || {};

    if (!title || !description || !category) {
      return res.status(400).json({
        error: "Missing required fields: title, description, category",
        received: req.body,
      });
    }

    // Optionally attach authenticated user as author (commented placeholder)
    req.body.author = req.user?._id;

    const kickData = {
      title,
      description,
      category,
      author: req.body.author,
    };

    // Add optional fields if provided
    if (location) kickData.location = location;
    if (targetDate) kickData.targetDate = targetDate;
    if (status) kickData.status = status;

    const newKick = await Kick.create(kickData);
    res.status(201).json(newKick);
  } catch (error) {
    console.error("Error creating kick:", error);

    if (error && error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

// GET /kicks
router.get("/", async (req, res) => {
  try {
    // Only fetch kicks for the authenticated user
    const kicks = await Kick.find({ author: req.user._id })
      .populate("author", "username")
      .sort({ createdAt: "desc" });
    res.status(200).json(kicks);
  } catch (error) {
    console.error("Error fetching kicks:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /kicks/:kickId
router.get("/:kickId", async (req, res) => {
  try {
    const { kickId } = req.params;

    const kick = await Kick.findById(kickId).populate([
      "author",
      "comments.author",
    ]);

    if (!kick) {
      return res.status(404).json({ error: "Kick not found" });
    }

    res.status(200).json(kick);
  } catch (error) {
    console.error("Error fetching kick:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /kicks/:kickId
router.delete("/:kickId", async (req, res) => {
  try {
    const { kickId } = req.params;

    const kick = await Kick.findById(kickId);
    if (!kick.author.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Kick.findByIdAndDelete(kickId);

    res.status(200).json({ message: "Kick deleted successfully" });
  } catch (error) {
    console.error("Error deleting kick:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /kicks/:kickId
router.put("/:kickId", async (req, res) => {
  try {
    const { kickId } = req.params;
    const { title, description, category, location, targetDate, status } =
      req.body || {};

    // Check if at least one field is provided
    if (
      !title &&
      !description &&
      !category &&
      !location &&
      !targetDate &&
      !status
    ) {
      return res.status(400).json({
        error: "At least one field is required for update",
        received: req.body,
      });
    }

    // First check if kick exists and user is authorized
    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res.status(404).json({ error: "Kick not found" });
    }

    if (!kick.author.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (location !== undefined) updateFields.location = location;
    if (targetDate !== undefined) updateFields.targetDate = targetDate;
    if (status !== undefined) updateFields.status = status;

    // Update using findByIdAndUpdate
    const updatedKick = await Kick.findByIdAndUpdate(kickId, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedKick);
  } catch (error) {
    console.error("Error updating kick:", error);

    if (error && error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

// POST /kicks/:kickId/comments
router.post("/:kickId/comments", async (req, res) => {
  try {
    const { kickId } = req.params;
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Missing required field: text",
        received: req.body,
      });
    }

    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res.status(404).json({ error: "Kick not found" });
    }

    const newComment = {
      text,
      author: req.user._id,
    };

    kick.comments.push(newComment);
    await kick.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /kicks/:kickId/comments/:commentId
router.delete("/:kickId/comments/:commentId", async (req, res) => {
  try {
    const { kickId, commentId } = req.params;

    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res.status(404).json({ error: "Kick not found" });
    }

    const comment = kick.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    kick.comments.pull(commentId);
    await kick.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /kicks/:kickId/comments/:commentId
router.put("/:kickId/comments/:commentId", async (req, res) => {
  try {
    const { kickId, commentId } = req.params;
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Missing required field: text",
        received: req.body,
      });
    }

    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res.status(404).json({ error: "Kick not found" });
    }

    const comment = kick.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    comment.text = text;
    await kick.save();

    res.status(200).json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /kicks/:kickId/status
// - For kicks to update status (eg. completed)
// - TODO: Figure out how to create this in back-end and front-end. It will be a radio button next to the kick.
router.patch("/:kickId/status", async (req, res) => {
  try {
    const { kickId } = req.params;
    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({
        error: "Missing required field: status",
        received: req.body,
      });
    }

    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res.status(404).json({ error: "Kick not found" });
    }

    if (!kick.author.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    kick.status = status;
    await kick.save();

    res.status(200).json(kick);
  } catch (error) {
    console.error("Error updating kick status:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
