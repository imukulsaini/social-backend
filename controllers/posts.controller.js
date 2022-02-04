async function checkPostID(req, res, next, id) {
  try {
    const isPostExist = await Post.findById(id);
    req.post = isPostExist;
    next();
  } catch (error) {
    res.status(404).json({ message: "post ID  is not Valid" });
  }
}
module.exports = checkPostID;
