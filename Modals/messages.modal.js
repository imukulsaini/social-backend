const mongoose = require("mongoose");

const { Conversation } = require("./conversations.modal");
const { User } = require("./users.modal");

const MessagesSchema = new mongoose.Schema(
  {
    object: {
      type: String,
      required: true,
    },

    conversationID: {
      type: String,
      ref: "Conversation",
      required: true,
    },

    senderID: {
      type: String,
      ref: "User",
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", MessagesSchema);

module.exports = { Messages };
