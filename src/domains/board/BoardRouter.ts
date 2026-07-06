import express from "express";
import BoardController from "./BoardController.js";

const router = express.Router();

router.patch("/:boardId", BoardController.UpdateBoard);

router.delete("/:boardId", BoardController.DeleteBoard);

router.post("/", BoardController.CreateBoard);


export default router;