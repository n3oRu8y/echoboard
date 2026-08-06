import express from "express";
import ReactionController from "./ReactionController.js";

const router = express.Router();

router.post("/boards/:boardUrl/posts/:postId/reactions", ReactionController.Reaction);

export default router;