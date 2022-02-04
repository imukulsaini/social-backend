const mongoose = require("mongoose");

const { Post } = require("./posts.modal");
const { User } = require("./users.modal");

const BookmarkSchema = new mongoose.Schema({
  object: {
    type: String,
    required: true,
  },
  userID: {
    type: String,
    ref: "User",
  },
  posts: [{ type: String, ref: "Post" }],
});

const Bookmark = mongoose.model("Bookmark", BookmarkSchema);

module.exports = { Bookmark };
