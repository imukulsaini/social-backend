const express = require("express");
const router = express.Router();

const { Like } = require("../Modals/likes.modal.js");
const { Post } = require("../Modals/posts.modal.js");
const { checkUserID } = require("../controllers/users.controller.js");

const {
  createNotification,
  deleteNotification,
} = require("../controllers/notification.controller.js");

router.param("userID", checkUserID);
router
  .route("/:userID/likes")
  .get(async (req, res) => {

    try{
      const getUserLikes = await Like.find({
        userID: req.params.userID,
      }).populate({
        path: "posts",
        model: "Post",
        populate: [
          {
            path: "postBy",
            model: "User",
          },
        ],
      });
  
      res.status(200).json({
        message: "user likes fecth successfully Done",
        likes: getUserLikes,
      });
    }catch(error){
      res.status(404).json({message:"Check Your UserID No Likes Found"})
    }
   
  })

  .post(async (req, res) => {
    const { postID } = req.body;
    const userID = req.params.userID;
    const post = await Post.findById(postID);

    post.likeBy.push(userID);
    post.likesCount = post.likesCount + 1;

    let findLikePostByUser = await Like.find({ userID: userID });

    if (findLikePostByUser.length === 0) {
      // entry of new user in Like collection

      const newLikeByUser = new Like({
        object: "like",

        posts: [postID],
        userID: userID,
      });

      await createNotification({
        text: "liked your Post",
        type: "like",
        postID: postID,
        user: userID,
        targetUser: post.postBy,
      });
      await newLikeByUser.save();
      await post.save();

      return res.status(201).json({ message: "a new Like created" });
    } else {
      let { _id } = findLikePostByUser[0];

      const updatePosts = await Like.findByIdAndUpdate(
        { _id: _id },
        { $addToSet: { posts: postID } },
        { new: true }
      );

      await createNotification({
        text: "liked your Post",
        type: "like",
        postID: postID,
        user: userID,
        targetUser: post.postBy,
      });

      await post.save();

      return res.status(201).json({
        message: "user like a new post",
        updatePosts,
        postID,
        userID,
      });
    }
  })

  .delete(async (req, res) => {
    const { postID } = req.body;
    const userID = req.params.userID;
    const post = await Post.findById(postID);

    post.likeBy.pull(userID);
    if (post.likesCount > 0) {
      post.likesCount = post.likesCount - 1;
    }

    const updatePosts = await Like.findOneAndUpdate(
      { userID: userID },
      { $pull: { posts: postID } },
      { new: true }
    );
    await post.save();
    await deleteNotification({ type: "like", userID });
    res.status(200).json({ message: "user unlike a post ", postID, userID });
  });

module.exports = router;
