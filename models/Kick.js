// IMPORT MONGOOSE
const mongoose = require("mongoose");

// DEFINE COMMENT SUBDOCUMENT SCHEMA
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// DEFINE KICK SCHEMA
const kickSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      enum: ["Travel", "Adventure", "Skills", "Personal", "Career", "Other"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Completed"],
      default: "Open",
    },
    completionDate: {
      type: Date,
    },
    targetDate: {
      type: Date,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

// REGISTER KICK MODEL
const Kick = mongoose.model("Kick", kickSchema);

// EXPORT KICK MODEL
module.exports = Kick;
