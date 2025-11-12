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

    if (!title || !category) {
      const missingFields = [];
      if (!title) missingFields.push("title");
      if (!category) missingFields.push("category");

      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(
          ", "
        )}. Please provide a title and category for your kick.`,
      });
    }

    const kickData = {
      title,
      category,
      author: req.user._id,
    };

    // Add optional fields if provided
    if (description) kickData.description = description;
    if (location) kickData.location = location;
    if (targetDate) kickData.targetDate = targetDate;
    if (status) kickData.status = status;

    const newKick = await Kick.create(kickData);
    res.status(201).json(newKick);
  } catch (error) {
    console.error("Error creating kick:", error);

    if (error && error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ error: `Validation failed: ${messages.join(". ")}` });
    }

    res.status(500).json({ error: "Failed to create kick. Please try again." });
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
    res.status(500).json({
      error:
        "Failed to load your kicks. Please refresh the page and try again.",
    });
  }
});

// GET /kicks/:kickId
router.get("/:kickId", async (req, res) => {
  try {
    const { kickId } = req.params;

    if (!kickId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid kick ID format." });
    }

    const kick = await Kick.findById(kickId).populate([
      "author",
      "comments.author",
    ]);

    if (!kick) {
      return res
        .status(404)
        .json({ error: "Kick not found. It may have been deleted." });
    }

    res.status(200).json(kick);
  } catch (error) {
    console.error("Error fetching kick:", error);
    res
      .status(500)
      .json({ error: "Failed to load kick details. Please try again." });
  }
});

// DELETE /kicks/:kickId
router.delete("/:kickId", async (req, res) => {
  try {
    const { kickId } = req.params;

    if (!kickId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid kick ID format." });
    }

    const kick = await Kick.findById(kickId);

    if (!kick) {
      return res.status(404).json({
        error: "Kick not found. It may have already been deleted.",
      });
    }

    if (!kick.author.equals(req.user._id)) {
      return res.status(403).json({
        error: "You do not have permission to delete this kick.",
      });
    }

    await Kick.findByIdAndDelete(kickId);

    res.status(200).json({ message: "Kick deleted successfully" });
  } catch (error) {
    console.error("Error deleting kick:", error);
    res.status(500).json({ error: "Failed to delete kick. Please try again." });
  }
});

// PUT /kicks/:kickId
router.put("/:kickId", async (req, res) => {
  try {
    const { kickId } = req.params;
    const { title, description, category, location, targetDate, status } =
      req.body || {};

    if (!kickId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid kick ID format." });
    }

    // Check if at least one field is provided
    if (
      title === undefined &&
      description === undefined &&
      category === undefined &&
      location === undefined &&
      targetDate === undefined &&
      status === undefined
    ) {
      return res.status(400).json({
        error:
          "Please provide at least one field to update (title, description, category, location, targetDate, or status).",
      });
    }

    // First check if kick exists and user is authorized
    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res
        .status(404)
        .json({ error: "Kick not found. It may have been deleted." });
    }

    if (!kick.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "You do not have permission to edit this kick." });
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
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ error: `Validation failed: ${messages.join(". ")}` });
    }

    res.status(500).json({ error: "Failed to update kick. Please try again." });
  }
});

// POST /kicks/:kickId/comments
router.post("/:kickId/comments", async (req, res) => {
  try {
    const { kickId } = req.params;
    const { text } = req.body || {};

    if (!kickId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid kick ID format." });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        error:
          "Comment text is required. Please write a comment before posting.",
      });
    }

    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res
        .status(404)
        .json({ error: "Kick not found. Cannot add comment." });
    }

    const newComment = {
      text: text.trim(),
      author: req.user._id,
    };

    kick.comments.push(newComment);
    await kick.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment. Please try again." });
  }
});

// DELETE /kicks/:kickId/comments/:commentId
router.delete("/:kickId/comments/:commentId", async (req, res) => {
  try {
    const { kickId, commentId } = req.params;

    if (!kickId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid kick ID format." });
    }

    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res
        .status(404)
        .json({ error: "Kick not found. Cannot delete comment." });
    }

    const comment = kick.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        error: "Comment not found. It may have already been deleted.",
      });
    }

    if (!comment.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments." });
    }

    kick.comments.pull(commentId);
    await kick.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(500)
      .json({ error: "Failed to delete comment. Please try again." });
  }
});

// PUT /kicks/:kickId/comments/:commentId
router.put("/:kickId/comments/:commentId", async (req, res) => {
  try {
    const { kickId, commentId } = req.params;
    const { text } = req.body || {};

    if (!kickId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid kick ID format." });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        error:
          "Comment text is required. Please provide text for your comment.",
      });
    }

    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res
        .status(404)
        .json({ error: "Kick not found. Cannot update comment." });
    }

    const comment = kick.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ error: "Comment not found. It may have been deleted." });
    }

    if (!comment.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "You can only edit your own comments." });
    }

    comment.text = text.trim();
    await kick.save();

    res.status(200).json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res
      .status(500)
      .json({ error: "Failed to update comment. Please try again." });
  }
});

// PATCH /kicks/:kickId/status
router.patch("/:kickId/status", async (req, res) => {
  try {
    const { kickId } = req.params;
    const { status } = req.body || {};

    if (!kickId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid kick ID format." });
    }

    if (!status) {
      return res.status(400).json({
        error:
          "Status is required. Please provide a valid status (Open or Completed).",
      });
    }

    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res
        .status(404)
        .json({ error: "Kick not found. Cannot update status." });
    }

    if (!kick.author.equals(req.user._id)) {
      return res.status(403).json({
        error: "You do not have permission to update this kick's status.",
      });
    }

    kick.status = status;
    await kick.save();

    res.status(200).json(kick);
  } catch (error) {
    console.error("Error updating kick status:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Invalid status value. Status must be 'Open' or 'Completed'.",
      });
    }

    res
      .status(500)
      .json({ error: "Failed to update kick status. Please try again." });
  }
});

module.exports = router;
