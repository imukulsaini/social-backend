const { Notification } = require("../Modals/notification.modal");

// create notification

async function createNotification({ text, type, postID, user, targetUser }) {
  const newNotification = await new Notification({
    object: "notifications",
    message: text,
    type: type,
    postID: postID,
    user: user,
    target: targetUser,
  });
  await newNotification.save();
}

// remove notification

async function deleteNotification({ userID, type }) {
  const result = await Notification.deleteMany({
    $and: [
      {
        type: type,
      },
      {
        user: userID,
      },
    ],
  });
}

module.exports = { createNotification, deleteNotification };
