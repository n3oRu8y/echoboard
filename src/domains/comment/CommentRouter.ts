import express from "express";
import CommentController from "./CommentController.js";

const router = express.Router();

router.delete("/boards/:boardUrl/posts/:postId/comments/:commentId", CommentController.Delete);

router.post("/boards/:boardUrl/posts/:postId/comments", CommentController.Create);

export default router;