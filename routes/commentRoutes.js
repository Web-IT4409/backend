const express = require("express");
const {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
} = require("../services/commentService");
const { tokenVerifier } = require("../middlewares/authMiddleware");
const { activeAccountFilter } = require("../middlewares/statusMiddleware");

const router = express.Router();

router.use(tokenVerifier);
router.use(activeAccountFilter);

router.post("/:postId", createComment);

router.get("/:postId", getAllComments);

router.patch("/:id", updateComment); // id is comment ID

router.delete("/:id", deleteComment); // id is comment ID

module.exports = router;
