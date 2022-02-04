const mongoose = require("mongoose");

const { Post } = require("./posts.modal");
const { User } = require("./users.modal");

const LikeSchema = new mongoose.Schema({
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

const Like = mongoose.model("Like", LikeSchema);

module.exports = { Like };
