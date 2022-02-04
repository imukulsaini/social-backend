const express = require("express");
const router = express.Router();
const { extend } = require("lodash");
const checkPostID = require("../controllers/posts.controller.js");
const { Post } = require("../Modals/posts.modal.js");
const authVerify = require("../middlewares/authverify.middleware");

const {
  createNotification,
  deleteNotification,
} = require("../controllers/notification.controller.js");

router.use(checkPostID);
router
  .route("/:postID/comments")
  .get(async (req, res) => {
    const postID = req.params.postID;
    const getAllComments = await Post.find(
      { _id: postID },
      { comments: 1 }
    ).populate("comments.commentBy");
    res.status(200).json({
      mesage: "comments fecth successfully Done ",
      comments: getAllComments,
    });
  })

  .post(authVerify, async (req, res) => {
    const { comment, commentBy } = req.body;

    const postID = req.params.postID;
    const newComment = await Post.findOneAndUpdate(
      { _id: postID },
      {
        $push: {
          comments: { commentBy: commentBy, comment: comment },
        },
      },
      {
        new: true,
      }
    )
      .select("comments")
      .select("postBy")
      .populate("comments.commentBy");

    const getPost = await Post.findById(postID);

    await createNotification({
      text: `commented your post : ${comment}`,
      type: "comment",
      postID: postID,
      user: commentBy,
      targetUser: getPost.postBy,
    });

    res.status(201).json({
      message: "new comment added ",
      comments: newComment,
    });
  });

router
  .route("/:postID/comments/:commentID")
  .get(async (req, res) => {
    const postID = req.params.postID;
    const commentID = req.params.commentID;
    let getPost = await Post.findById(postID);

    let { comments } = getPost;
    let getComment = comments.find((comment) => comment.id === commentID);
    res.status(200).json({
      comment: getComment,
    });
  })

  .delete(authVerify, async (req, res) => {
    const postID = req.params.postID;
    const commentID = req.params.commentID;

    let getPost = await Post.findById(postID);

    const getComment = getPost.comments.filter(
      (comment) => comment._id != commentID
    );

    res.json({ getComment });

    const updatePost = await Post.findByIdAndUpdate(postID, {
      $set: {
        comments: getComment,
      },
    });
    res.status(204).send();
  });

module.exports = router;
