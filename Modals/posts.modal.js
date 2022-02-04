const mongoose = require("mongoose");

const { User } = require("./users.modal");

const PostSchema = new mongoose.Schema(
  {
    object: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    likeBy: [{ type: String, ref: "User" }],

    bookmarkBy: [{ type: String, ref: "User" }],

    postBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    imageUrl: {
      type: String,
    },
    comments: [
      {
        commentBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: {
          type: String,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    commentsCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = { Post };
