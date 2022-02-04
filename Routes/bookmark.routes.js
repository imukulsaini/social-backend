const express = require("express");
const router = express.Router();

const { Bookmark } = require("../Modals/bookmark.modal.js");
const { Post } = require("../Modals/posts.modal.js");
const { checkUserID } = require("../controllers/users.controller.js");

router
  .route("/:userID/bookmarks")
  .get(async (req, res) => {
    try {
      const getUserBookMark = await Bookmark.find({
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
      res.status(200).json({ bookmarks: getUserBookMark });
    } catch (error) {
      res.status(404).json({ message: "check your userID No Bookmark Found" });
    }
  })

  .post(async (req, res) => {
    const userID = req.params.userID;

    const { postID } = req.body;

    const post = await Post.findById(postID);

    post.bookmarkBy.push(userID);

    const checkBookmark = await Bookmark.find({ userID: userID });

    if (checkBookmark.length === 0) {
      const newBookmark = new Bookmark({
        object: "bookmark",
        userID: userID,
        posts: [postID],
      });

      await post.save();
      await newBookmark.save();

      return res.json({ status: 201, userID, postID });
    } else {
      const { _id } = checkBookmark[0];

      const addInBookmark = await Bookmark.findOneAndUpdate(
        { _id: _id },
        {
          $addToSet: {
            posts: postID,
          },
        },
        { new: true }
      );
      await post.save();
      return res.status(201).json({ userID, postID });
    }
  })

  .delete(async (req, res) => {
    const { postID } = req.body;
    const userID = req.params.userID;

    const post = await Post.findById(postID);

    post.bookmarkBy.pull(userID);

    const deletePostInBookmark = await Bookmark.findOneAndUpdate(
      { userID: userID },
      {
        $pull: {
          posts: postID,
        },
      },
      { new: true }
    );
    await post.save();

    res
      .status(200)
      .json({ message: "post deleted from bookmark by user ", postID, userID });
  });

module.exports = router;
