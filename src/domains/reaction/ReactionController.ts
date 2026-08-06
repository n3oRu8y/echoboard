import type { Request, Response } from "express";
import ReactionRepository from "./ReactionRepository.js";
import ReacitonService from "./ReactionService.js";
import UserRepo from "../user/UserRepository.js";
import UserService from "../user/UserService.js";
import dayjs from "dayjs";
import PostRepository from "../post/PostRepositorty.js";
import PostService from "../post/PostService.js";
import AttachmentRepository from "../attachment/AttachmentRepository.js";
import BoardRepo from "../board/BoardRepository.js";
import BoardService from "../board/BoardService.js";

export default class ReactionController {
    private static userRepository = new UserRepo();
    private static userService = new UserService(ReactionController.userRepository);

    private static boardRepository = new BoardRepo();
    private static boardService = new BoardService(ReactionController.boardRepository);

    private static postRepository = new PostRepository();
    private static attachmentRepository = new AttachmentRepository();
    private static postService = new PostService(ReactionController.postRepository, ReactionController.attachmentRepository);

    private static reactionRepository = new ReactionRepository();
    private static reactionService = new ReacitonService(ReactionController.reactionRepository);

    private constructor() {};

    public static async Reaction(req: Request, res: Response) {
        if (!req.session.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const type = req.body.type;
        if (type == undefined) {
            return res.status(400).json({ status: "error", message: "필수 인자 누락"});
        }

        if (typeof type != "number") {
            return res.status(400).json({ status: "error", message: "잘못된 요청입니다."});
        }

        if (Number(type) != 0 && Number(type) != 1) {
            return res.status(400).json({ status: "error", message: "잘못된 요청입니다."});
        }

        const boardUrl = req.params.boardUrl as string;
        const board = await ReactionController.boardService.GetByUrl(boardUrl, true);
        if (!board) {
            return res.status(404).json({ status: "error", message: "게시판을 찾을 수 없습니다."});
        }

        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 0) {
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다."});
        }

        const post = await ReactionController.postService.GetPost(postId, true);
        if (!post) {
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다."});
        }

        if (post.boardId != board.id) {
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다."});
        }
 
        const user = await ReactionController.userService.GetUserWithUserId(req.session.userId);
        if (user.IsBanned()) {
            return res.status(403).json({
                status: "error",
                message: `차단된 유저입니다.\n사유: ${user.banReason ? user.banReason : "사유 없음"}\n차단 해제 시간: ${dayjs(user.bannedUntil).format("YYYY년 MM월 DD일 HH시 mm분 ss초")}`
            });
        }

        if (!board.canWrite && user.role != "ADMIN") {
            return res.status(404).json({ status: "error", message: "권한이 없습니다." });
        }

        await ReactionController.reactionService.ToggleReatcion(user.id!, post.id!, Number(type));

        return res.status(200).json({ status: "ok" });
    }
}