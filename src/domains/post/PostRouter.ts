import express from "express";
import PostController from "./PostController.js";

const router = express.Router();

router.patch("/boards/:boardUrl/posts/:postId", PostController.UpdatePost);

router.post("/boards/:boardUrl/posts", PostController.CreatePost);

router.delete("/boards/:boardUrl/posts/:postId", PostController.DeletePost);

export default router;