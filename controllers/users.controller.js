const { User } = require("../Modals/users.modal");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const mySecret = process.env["mySecret"];

// Check User ID

async function checkUserID(req, res, next, id) {
  try {
    const userIdCheck = await User.findById(id)
      .populate("followers")
      .populate("following");

    req.user = userIdCheck;
    next();
  } catch (error) {
    res.status(404).json({ message: "User ID is not found " });
  }
}

// Get User Data

async function getUserData(req, res) {
  const { userId } = req;
  const { user } = req;

  let paramUserId = user._id.toString();
  let tokenUserId = userId.userID.toString();

  if (paramUserId === tokenUserId) {
    const token = jwt.sign({ userID: user._id }, mySecret, {
      expiresIn: "24h",
    });
    return res.status(200).json({ userData: user, token });
  } else {
    return res.status(401).json({ message: " token in not valid " });
  }
}

// Remove User

async function removeUser(req, res) {
  const userID = req.params.userID;
  console.log("user delete ho rha h");
  await User.findByIdAndRemove(userID);
  res.status(204).send();
}

// Update UserData

async function updateUserProfile(userID, userData) {
  const upadatedUser = await User.findOneAndUpdate(
    { _id: userID },
    {
      $set: userData,
    },
    { new: true }
  );
  return upadatedUser;
}

// update Password

async function updateUserPassword(userID, newPassword) {
  const upadatedUser = await User.findByIdAndUpdate(
    userID,
    {
      password: newPassword,
    },
    { new: true }
  );
  return upadatedUser;
}

// Compare And Update UserPassword

async function compareAndUpdatePassword(
  userID,
  currentPassword,
  userOldPassword,
  newPassword
) {
  const passwordCheck = await bcrypt.compare(currentPassword, userOldPassword);

  if (passwordCheck) {
    const hashPassword = await bcrypt.hashSync(newPassword, saltRounds);

    const updatedUser = await updateUserPassword(userID, hashPassword);

    return true;
  } else {
    return false;
  }
}

module.exports = {
  checkUserID,
  getUserData,
  removeUser,
  updateUserProfile,
  compareAndUpdatePassword,
};
