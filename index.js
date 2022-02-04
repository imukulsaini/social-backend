const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const authVerify = require("./middlewares/authverify.middleware.js");
const checkPostID = require("./controllers/posts.controller");
const { checkUserID } = require("./controllers/users.controller");
const apiKey = process.env["ApiKey"];
const {
  routeErrorHandler,
} = require("./middlewares/routeErrorHandler.middleware");
const { errorHandler } = require("./middlewares/errorHandler.middleware");

app.use(cors());
app.use(bodyParser.json());

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: apiKey,
  },
});

//db connect

const { initializeDBConnection } = require("./db/db.connect.js");
const PORT = 3000;
initializeDBConnection();

const usersV1 = require("./Routes/users.routes.js");
const postsV1 = require("./Routes/post.routes.js");
const commentsV1 = require("./Routes/comment.routes.js");
const messagesV1 = require("./Routes/messages.routes.js");
const bookmarksV1 = require("./Routes/bookmark.routes.js");
const likesV1 = require("./Routes/likes.routes.js");
const notificationsV1 = require("./Routes/notification.routes.js");

app.use("/v1/", usersV1);
app.use("/v1/", postsV1);

// app.param("userID", checkUserID);
app.use("/v1/users", authVerify, bookmarksV1);
app.use("/v1/users", authVerify, likesV1);
app.use("/v1/users", authVerify, messagesV1);

app.use("/v1/users", authVerify, notificationsV1);
// app.param("postID", checkPostID);

app.use("/v1/posts", commentsV1);

// 404 Route Handler

app.use(routeErrorHandler);

//  Error Handler

app.use(errorHandler);

// socket connection

let onlineUsers = [];

async function addUsers(userID, socketID) {
  !onlineUsers.some((user) => user.userID === userID) &&
    onlineUsers.push({ userID, socketID });
}

function removeOnlineUser(socketID) {
  onlineUsers = onlineUsers.filter((user) => user.socketID !== socketID);
}

function getReciever(receiverID) {
  return onlineUsers.find((user) => user.userID === receiverID);
}

io.on("connection", (socket) => {
  console.log("socket connected");

  socket.on("addUsers", (userID) => {
    addUsers(userID, socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });

  // Socket Connection for Messages
  socket.on(
    "sendMessage",
    ({ createdAt, message, senderID, receiverID, conversationID }) => {
      const reciever = getReciever(receiverID);
      if (reciever === undefined) {
        // console.log("reciever is not active right now")
      } else {
        io.to(reciever.socketID).emit("getNewMessage", {
          senderID,
          message,
          createdAt,
          conversationID,
        });
      }
    }
  );

  // Socket Connection For Comments

  socket.on("addComment", ({ createdAt, text, _id, commentBy, postID }) => {
    const comment = {
      comment: text,
      commentBy,
      postID,
      createdAt,
      _id,
    };
    io.emit("newCommentAdded", comment);
  });

  // Socket Connection For Likes

  socket.on("likePost", ({ userID, postID }) => {
    io.emit("likeInfo", { userID, postID });
  });

  socket.on("unLikePost", ({ userID, postID }) => {
    io.emit("unLikeInfo", { userID, postID });
  });

  // socket Connection For Bookmark

  socket.on("addBookmark", ({ userID, postID }) => {
    const getUserSocket = getReciever(userID);
    if (getUserSocket != undefined) {
      io.to(getUserSocket.socketID).emit("addBookmarkInfo", { userID, postID });
    }
  });

  socket.on("removeBookmark", ({ userID, postID }) => {
    const getUserSocket = getReciever(userID);
    if (getUserSocket != undefined) {
      io.to(getUserSocket.socketID).emit("removeBookmarkInfo", {
        userID,
        postID,
      });
    }
  });

  // socket connection For Follow

  socket.on("follow", ({ followerID, followingID, profile }) => {
    const result = {
      followerID,
      followingID,
      profile,
    };
    const getFollowerSocket = getReciever(followerID);
    if (getFollowerSocket === undefined) {
    } else {
      io.to(getFollowerSocket.socketID).emit("getFollowInfo", result);
    }

    // io.emit("getFollowInfo", result);
  });

  socket.on("unfollow", ({ followerID, followingID }) => {
    const result = {
      followerID,
      followingID,
    };
    io.emit("getUnfollowInfo", result);
  });

  // Socket Connection For Notifications

  socket.on("sendNotification", ({ message, targetUser }) => {
    const reciever = getReciever(targetUser);
    if (reciever === undefined) {
      console.log("user is not active");
    } else {
      io.to(reciever.socketID).emit("getNewNotification", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("a user disconnect ");
    removeOnlineUser(socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

// port establish

server.listen(PORT, () => {
  console.log("server started");
});
