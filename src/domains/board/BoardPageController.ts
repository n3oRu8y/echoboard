import type { Request, Response } from "express";
import BoardService from "./BoardService.js";
import BoardRepo from "./BoardRepository.js";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import PostService from "../post/PostService.js";
import PostRepository from "../post/PostRepositorty.js";
import AttachmentRepository from "../attachment/AttachmentRepository.js";
import FormatDatetime from "../../common/utils/FormatDatetime.js";

export default class BoardPageController {
    public static async RenderBoardList(req: Request, res: Response) {
        const boardService = new BoardService(new BoardRepo());
        const boards = await boardService.GetAll(true);
        return res.render("board/boards.ejs", {
            boards: boards,
            format: FormatDatetime,
            title: "홈"
        });
    }

    public static async RenderBoardPage(req: Request, res: Response) {
        const boardService = new BoardService(new BoardRepo());
        const board = await boardService.GetByUrl(req.params.boardId as string, true);
        if (!board) {
            return res.status(404).render("errors/404.ejs");
        }

        if (!board.canRead) {
            if (!req.session.userId) {
                return res.status(401).render("errors/alert.ejs", { message : "로그인이 필요합니다." });
            }

            const userService = new UserService(new UserRepo());
            const user = await userService.GetUserWithUserId(req.session.userId);
            if (user.role != "ADMIN") return res.status(401).render("errors/alert.ejs", { message : "게시판 보기 권한이 없습니다." });
        }

        let page = Number(req.query.page ?? 1);
        if (!Number.isInteger(page) || page < 1) page = 1;

        const query = req.query.query as string;

        const postService = new PostService(new PostRepository(), new AttachmentRepository());
        const posts = await postService.GetBoardPosts(board.id!, page, query);
        const totalPosts = await postService.GetBoardPostCount(board.id!, query);
        const totalPages = Math.max(1, Math.ceil(totalPosts / 10));
        
        return res.render("board/board.ejs", {
            board: board,
            posts: posts,
            totalPages: totalPages,
            currentPage: page,
            format: FormatDatetime,
            query: query,
            title: board.name
        });
    }
}