const express = require("express");
const app = express();

const router = express.Router();

const { Post } = require("../Modals/posts.modal.js");
const { User } = require("../Modals/users.modal.js");

const checkPostID = require("../controllers/posts.controller.js");
const { checkUserID } = require("../controllers/users.controller.js");
const authVerify = require("../middlewares/authverify.middleware.js");

router.route("/posts/:postID").get(checkPostID, async (req, res) => {
  const postID = req.params.postID;
  const posts = await Post.findById(postID).populate("postBy");
  res.status(200).json({ message: "post fetch successfully Done ", posts });
});

router.use(checkUserID);
router
  .route("/users/:userID/posts/timeline")
  .get(authVerify, async (req, res) => {
    const userID = req.params.userID;

    const getUserByID = await User.find({ _id: userID }).select("following");
    if (getUserByID[0].following != undefined) {
      let userFollowingID = getUserByID[0].following;

      userFollowingID.push(userID);

      const getAllPostsByFollowingID = await Post.find({
        postBy: { $in: userFollowingID },
      })
        .sort({ createdAt: -1 })
        .populate("postBy");
      //   .populate("bookmarkBy")
      //   .populate("likeBy");

      res.status(200).json({
        message: "user's timeline fetch successfully Done",
        posts: getAllPostsByFollowingID,
      });
    }
  });

router
  .route("/users/:userID/posts")
  .get(async (req, res) => {
    const userID = req.params.userID;
    const getUserPosts = await Post.find({ postBy: userID }).populate("postBy");
    res.status(200).json({
      message: "user's posts fetch successfully Done ",
      posts: getUserPosts,
    });
  })
  .post(authVerify, async (req, res) => {
    const postBy = req.params.userID;

    const { postData } = req.body;

    const NewPost = new Post({
      object: "posts",
      postBy: postBy,
      caption: postData.caption,
      imageUrl: postData.imageUrl,
    });

    const saveNewPost = await NewPost.save();
    await saveNewPost.populate("postBy").execPopulate();
    res.status(201).json({
      post: saveNewPost,
      message: "new post successfully added",
    });
  });

router
  .route("/users/:userID/posts/:postID")
  .get(async (req, res) => {
    const postID = req.params.postID;
    const posts = await Post.findById(postID).populate("postBy");
    res.status(200).json({ message: "Post fetch successfully Done", posts });
  })

  .post(authVerify, async (req, res) => {
    const { caption, image } = req.body;

    const updateDocument = await Post.findByIdAndUpdate(
      { _id: req.params.postId },
      {
        image: image,
        caption: caption,
      },
      { new: true }
    );

    res.status(201).json({
      message: "post updated",
      post: updateDocument,
    });
  })

  .delete(authVerify, async (req, res) => {
    await Post.findByAndRemove(req.params.postId);
    res.status(204).send();
  });

module.exports = router;
