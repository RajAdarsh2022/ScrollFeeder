const express = require("express");
const {createPost , likeAndUnlikePost, deletePost, getPostOfFollowing, updateCaption, commentOnPost, deleteComment} = require("../controllers/post");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

//Applying multiple handlers to a single route , so that we cn protect the route
//i.e. only logged in users can create a post
router.route("/post/upload").post(isAuthenticated,createPost)

router
    .route("/post/:id")
    .get(isAuthenticated,likeAndUnlikePost)
    .put(isAuthenticated, updateCaption)
    .delete(isAuthenticated,deletePost)

router.route("/posts").get(isAuthenticated, getPostOfFollowing);
router
    .route("/post/comment/:id")
    .put(isAuthenticated, commentOnPost)
    .delete(isAuthenticated, deleteComment);
module.exports = router;