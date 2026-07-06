import express from "express";
import BoardController from "./BoardController.js";

const router = express.Router();

router.post("/", BoardController.CreateBoard);

router.patch("/:boardId", BoardController.UpdateBoard);

export default router;