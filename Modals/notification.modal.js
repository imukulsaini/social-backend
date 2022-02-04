const mongoose = require("mongoose");

const { Post } = require("./posts.modal");
const { User } = require("./users.modal");

const NotificationSchema = new mongoose.Schema(
  {
    object: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },

    type: {
      type: String,
      required: true,
    },

    read: { type: Boolean, default: false },

    postID: { type: String, ref: "Post" },
    user: { type: String, ref: "User" },
    target: { type: String, ref: "User" },
  },

  {
    timestamps: true,
  }
);

const Notification = mongoose.model("notification", NotificationSchema);

module.exports = { Notification };
