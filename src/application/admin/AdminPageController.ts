import type { Request, Response } from "express";
import AdminService from "./AdminService.js";
import BoardRepo from "../../domains/board/BoardRepository.js";
import BoardService from "../../domains/board/BoardService.js";

export default class AdminPageController {
    private static boardRepo = new BoardRepo();
    private static boardService = new BoardService(AdminPageController.boardRepo);

    public static async AdminHomePage(req: Request, res: Response) {
        const stats = await AdminService.GetDashboardStats();
        return res.render("admin/index.ejs", { title: "대시보드", stats: stats });
    }

    public static async SetBoardPage(req: Request, res: Response) {
        const boards = await AdminPageController.boardService.GetAll(false, true);
        return res.render("admin/boards.ejs", {
            title: "게시판 설정",
            boards: boards
        });
    }
}