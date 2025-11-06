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
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Travel", "Hobbies", "Sports", "Skills", "Fears", "Other"],
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
