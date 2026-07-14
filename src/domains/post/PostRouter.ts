import express from "express";
import PostController from "./PostController.js";

const router = express.Router();

router.patch("/boards/:boardId/posts/:postId", PostController.UpdatePost);

router.post("/boards/:boardId/posts", PostController.CreatePost);

router.delete("/boards/:boardId/posts/:postId", PostController.DeletePost);

export default router;