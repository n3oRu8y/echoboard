import type { Request, Response } from "express";
import AdminService from "./AdminService.js";
import BoardRepo from "../../domains/board/BoardRepository.js";
import BoardService from "../../domains/board/BoardService.js";
import FormatDatetime from "../../common/utils/FormatDatetime.js";
import UserRepo from "../../domains/user/UserRepository.js";
import UserService from "../../domains/user/UserService.js";
import dayjs from "dayjs";

export default class AdminPageController {
    private static boardRepo = new BoardRepo();
    private static boardService = new BoardService(AdminPageController.boardRepo);

    private static userRepo = new UserRepo();
    private static userService = new UserService(AdminPageController.userRepo);

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

    public static async UserListPage(req: Request, res: Response) {
        let page = Number(req.query.query);
        if (!Number.isInteger(page) || page <= 0)
            page = 1;
        const query = req.query.query as string;
        const users = await AdminService.GetUserList(query, 10, 10 * (page - 1));
        const totalPages = await AdminService.GetUserCount(query);
        return res.render("admin/users.ejs", {
            title: "유저 관리",
            users: users,
            page: page,
            query: query,
            totalPages: totalPages,
            Format: FormatDatetime
        });
    }

    public static async UserDetailPage(req: Request, res: Response) {
        const user = await AdminPageController.userService.GetUserWithUserId(req.params.userId as string, true);
        if (!user) {
            return res.status(404).render("errors/404.ejs");
        }
        return res.render("admin/user.ejs", { 
            layout: false,
            title: "유저 관리",
            Format: (date: Date) => dayjs(date).format("YYYY-MM-DD"),
            ToDateTimeLocal: (date: Date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
            user: user
        });
    }
}