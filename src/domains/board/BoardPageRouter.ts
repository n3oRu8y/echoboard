import express from "express";
import BoardPageController from "./BoardPageController.js";

const router = express.Router();

router.get("/", BoardPageController.RenderBoardList);
router.get("/boards/:boardId", BoardPageController.RenderBoardPage);

export default router;