const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const mySecret = process.env["mySecret"];

const bcrypt = require("bcrypt");
const saltRounds = 10;
const {
  createNotification,
  deleteNotification,
} = require("../controllers/notification.controller.js");

const {
  checkUserID,
  getUserData,
  removeUser,
  updateUserProfile,
  compareAndUpdatePassword,
} = require("../controllers/users.controller.js");

const authVerify = require("../middlewares/authverify.middleware.js");

const { User } = require("../Modals/users.modal");

router.route("/login").post(async (req, res) => {
  let getUserData = req.body;
  let { username, password } = getUserData;
  try {
    const isUsernameExist = await User.findOne({ username: username });
    if (isUsernameExist) {
      const passwordCheck = await bcrypt.compare(
        password,
        isUsernameExist.password
      );

      if (passwordCheck) {
        const token = jwt.sign({ userID: isUsernameExist._id }, mySecret);
        return res.status(201).json({ userData: isUsernameExist, token });
      } else {
        console.log("password not correct");
        return res.status(403).json({ message: "password is not correct" });
      }
    } else {
      return res.status(404).json({ message: "user is not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.route("/signup").post(async (req, res) => {
  let getUserData = req.body;
  console.log("signup", getUserData);
  let { username, password } = getUserData;

  try {
    const isUserExistCheck = await User.findOne({ username: username });
    if (isUserExistCheck) {
      return res.status(403).json({ message: "user already exist " });
    } else {
      const hashPassword = bcrypt.hashSync(password, saltRounds);

      getUserData.password = hashPassword;

      const NewUser = new User(getUserData);

      const newUserData = await NewUser.save();

      const token = jwt.sign({ userID: newUserData._id }, mySecret);

      return res.status(201).json({
        message: "New User Saved Successfully ",
        userData: newUserData,
        token,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.route("/profile/:username").get(authVerify ,async (req, res) => {
  const { username } = req.params;
  try {
      const getUserData = await User.findOne({ username: username })
          .populate("followers")
          .populate("following");
      res
          .status(200)
          .json({ message: "fetch user data successfull", user: getUserData });
  } catch (error) {
      res.json.status(404).json({ message: "user profile is not found" })
  }

});

router.route("/search/:name").get(authVerify, async (req, res) => {
  const { name } = req.params;

  try {
    const getResult = await User.find({
      $or: [
        { username: { $regex: name, $options: "i" } },
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ],
    });

    res
      .status(200)
      .json({ message: "fetch user data successfull", result: getResult });
  } catch (error) {
    res.status(404).json({ message: "No User Found" });
  }
});

router.param("userID", checkUserID);
router
  .route("/users/:userID")
  .get(authVerify, getUserData)
  .delete(authVerify, removeUser);

router.route("/users/:userID/profile").post(authVerify, async (req, res) => {
  const userData = req.body;
  const userID = req.params.userID;
  const updatedData = await updateUserProfile(userID, userData);
  res.status(201).json({
    message: "User Profile updated",
    userData: updatedData,
  });
});

router.route("/users/:userID/password").post(
  (authVerify,
  async (req, res) => {
    const { user } = req;
    const userID = req.params.userID;
    const { currentPassword, newPassword } = req.body;
    const isPasswordUpdated = await compareAndUpdatePassword(
      userID,
      currentPassword,
      user.password,
      newPassword
    );

    if (isPasswordUpdated) {
      res.status(201).json({
        message: "User Password updated ",
      });
    } else {
      res.status(403).json({ message: "Your Current Password is incorrect" });
    }
  })
);

router
  .route("/users/:userID/follow")
  .post(authVerify, async (req, res) => {
    const { userId } = req.body;
    let { user } = req;
    let { following, _id } = req.user;

    following.push(userId);

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          followers: req.params.userID,
        },
      },
      { new: true }
    );

    await createNotification({
      type: "follow",
      text: "followed You",
      user: _id,
      targetUser: userId,
    });

    await user.save();

    res.status(201).json({
      message: "user is now following another user",
    });
  })

  .delete(authVerify, async (req, res) => {
    const { userId } = req.body;
    const { user } = req;
    let { following, _id } = req.user;

    following.pull(userId);
    await user.save();

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $pull: {
          followers: req.params.userID,
        },
      },
      { new: true }
    );
    await deleteNotification({
      type: "follow",
      userID: _id,
    });
    res.status(204).send();
  });

router.route("/users/:userID/followers").get((req, res) => {
  const { user } = req;
  let { followers } = user;
  res.status(200).json({
    message: "User followers fetch Successfully Done ",
    followers,
  });
});

router.route("/users/:userID/following").get((req, res) => {
  const { user } = req;
  let { following } = user;
  res.status(200).json({
    message: "User following fetch Successfull ",
    following,
  });
});

module.exports = router;
