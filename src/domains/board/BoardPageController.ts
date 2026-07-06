import type { Request, Response } from "express";
import BoardService from "./BoardService.js";
import BoardRepo from "./BoardRepository.js";

export default class BoardPageController {
    public static async RenderBoardList(req: Request, res: Response) {
        const boardService = new BoardService(new BoardRepo());
        const boards = await boardService.GetAll();
        return res.render("board/boards.ejs", {
            boards
        });
    }
}