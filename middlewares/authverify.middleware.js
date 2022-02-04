const jwt = require("jsonwebtoken");
const mySecret = process.env["mySecret"];

const bcrypt = require("bcrypt");
const saltRounds = 10;

function authVerify(req, res, next) {
  const token = req.headers.authorization;
  try {
    let decoded = jwt.verify(token, mySecret);
    req.userId = { userID: decoded.userID };
    return next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: " An authentication error." });
  }
}

module.exports = authVerify;
