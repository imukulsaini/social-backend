const express = require("express");
const router = express.Router();
const { extend } = require("lodash");

const { Conversation } = require("../Modals/conversations.modal.js");
const { Messages } = require("../Modals/messages.modal.js");
const { checkUserID } = require("../controllers/users.controller.js");

router.param("userID", checkUserID);
router
  .route("/:userID/conversation")
  .get(async (req, res) => {
    const userID = req.params.userID;
    
    const getMembersByUserID = await Conversation.find({
      members: { $in: userID },
    }).populate("members");

    res.status(200).json({
      message: " user's conversation fetch successfully Done",
      conversation: getMembersByUserID,
    });
  })

  .post(async (req, res) => {
    const { receiverID, senderID } = req.body;
    const userID = req.params.userID;

    const getMembersByUserID = await Conversation.find({
      members: { $all: [receiverID, senderID] },
    }).populate("members");

    if (getMembersByUserID.length > 0) {
      res.status(200).json({ conversation: getMembersByUserID });
    } else {
      const addInConversation = new Conversation({
        object: "conversation",
        members: [receiverID, senderID],
      });
      await addInConversation.save();
      await addInConversation.populate("members").execPopulate();

      res.status(201).json({ conversation: addInConversation });
    }
  });

router
  .route("/:userID/conversation/:conversationID/messages")
  .get(async (req, res) => {
    const conversationID = req.params.conversationID;
    console.log("get messages");

    try {
      const getAllMessages = await Messages.find({
        conversationID: conversationID,
      }).populate("senderID");

      res.status(200).json({
        message: "user's message fetch successfully Done ",
        messages: getAllMessages,
      });
    } catch (error) {
      res.status(404).json({ message: "conversation ID is not Found" });
    }
  })

  .post(async (req, res) => {
    const userID = req.params.userID;
    const conversationID = req.params.conversationID;
    console.log("message respone");
    const { message } = req.body;
    const addInMessage = new Messages({
      object: "message",
      conversationID: conversationID,
      senderID: userID,
      message: message,
    });
    await addInMessage.save();
    await addInMessage.populate("senderID").execPopulate();

    res.status(201).json({ message: addInMessage });
  });

module.exports = router;
