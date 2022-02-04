const mongoose = require("mongoose");

const { User } = require("./users.modal");

const ConversationSchema = new mongoose.Schema(
  {
    object: {
      type: String,
      required: true,
    },

    members: [{ type: String, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = { Conversation };
