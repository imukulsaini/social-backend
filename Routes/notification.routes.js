const express = require("express");
const router = express.Router();
const { extend } = require("lodash");

const { checkUserID } = require("../controllers/users.controller.js");
const { Notification } = require("../Modals/notification.modal");

const createNotification = require("../controllers/notification.controller.js");

router.use(checkUserID);

router.route("/:userID/notifications").get(async (req, res) => {
  const getUserNotifications = await Notification.find({
    target: req.params.userID,
  }).populate("user");

  res
    .status(200)
    .json({
      message: "user's notification fecth successfully Done",
      notifications: getUserNotifications,
    });
});

router.route("/:userID/notifications/read").post(async (req, res) => {
  console.log(req.params.userID);

  console.log("read all krene aya hai");
  const readAllNotification = await Notification.updateMany(
    { target: req.params.userID },
    { read: true },
    { new: true }
  );

  res.status(200).json({
    message: "notification read by user",
    // notifications:readAllNotification
  });
});

router
  .route("/:userID/notifications/:notificationID/read")
  .post(async (req, res) => {
    const updateNotification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationID },
      { read: true },
      { new: true }
    );

    res.status(201).json({
      message: "notification read by user",
      updatedNotifications: updateNotification,
    });
  });

module.exports = router;
