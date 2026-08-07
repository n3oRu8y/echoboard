import type { Request, Response } from "express";
import PostRepository from "../post/PostRepositorty.js";
import PostService from "../post/PostService.js";
import AttachmentRepository from "../attachment/AttachmentRepository.js";
import UserRepo from "../user/UserRepository.js";
import UserService from "../user/UserService.js";
import BoardRepo from "../board/BoardRepository.js";
import BoardService from "../board/BoardService.js";
import CommentRepository from "./CommentRepository.js";
import CommentService from "./CommentService.js";
import TurnstileFailed from "../../infrastructures/turnstile/exceptions/TurnstileFailed.js";

export default class CommentController {
    private constructor() {};

    private static userRepo = new UserRepo();
    private static userService = new UserService(CommentController.userRepo);

    private static boardRepo = new BoardRepo();
    private static boardService = new BoardService(CommentController.boardRepo);

    private static postRepo = new PostRepository();
    private static attachmentRepo = new AttachmentRepository();
    private static postService = new PostService(CommentController.postRepo, CommentController.attachmentRepo);

    private static commentRepo = new CommentRepository();
    private static commentService = new CommentService(CommentController.commentRepo);


    public static async Create(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const content = req.body.content;
        const isAnonymous = !!req.body.isAnonymous;

        if (!content) {
            return res.status(400).json({ status: "error", message: "댓글을 입력해주세요." });
        }

        const token = req.body.token as string;
        const ip = req.ip!;
        if (!token) {
            return res.status(400).json({ status: "error", message: "Turnstile 토큰이 입력되지 않았습니다." });
        }

        const boardUrl = req.params.boardUrl as string;
        const board = await CommentController.boardService.GetByUrl(boardUrl, true);
        if (!board) {
            return res.status(404).json({ status: "error", message: "게시판을 찾을 수 없습니다." });
        }

        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 0) 
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다." });

        const post = await CommentController.postService.GetPost(postId, boardUrl, true);
        if (!post)
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다." });

        const parentId = req.body.parentId;
        if (parentId != undefined && parentId != null) {
            const comment = CommentController.commentService.Get(Number(parentId));
            if (!comment) 
                return res.status(404).json({ status: "error", message: "원댓글을 찾을 수 없습니다." });
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId);
        if (user.IsBanned()) {
            return res.status(403).json({ status: "error", message: "차단된 사용자입니다." });
        }

        try {
            await CommentController.commentService.Create(req.session.userId, isAnonymous, req.body.content, post.id!, (parentId != undefined && parentId != null) ? Number(parentId) : null, token, ip);
        } catch (e) {
            if (e instanceof TurnstileFailed) {
                return res.status(403).json({ status: "error", message: "보안 작업을 실패했습니다." });
            }
            throw e;
        }

        return res.status(201).json({ status: "ok" });
    }

    public static async Delete(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const boardUrl = req.params.boardUrl as string;
        const board = await CommentController.boardService.GetByUrl(boardUrl, true);
        if (!board) {
            return res.status(404).json({ status: "error", message: "게시판을 찾을 수 없습니다." });
        }

        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 0) 
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다." });

        const post = await CommentController.postService.GetPost(postId, boardUrl, true);
        if (!post)
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다." });

        const commentId = Number(req.params.commentId);
        if (!Number.isInteger(commentId) || commentId < 0) {
            return res.status(404).json({ status: "error", message: "댓글을 찾을 수 없습니다." });
        }
        
        const comment = await CommentController.commentRepo.FindById(commentId);
        if (!comment) {
            return res.status(404).json({ status: "error", message: "댓글을 찾을 수 없습니다." });
        }

        const user = await CommentController.userService.GetUserWithUserId(req.session.userId);
        if (!user) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        if (user.role != "ADMIN" && comment.authorId != user.id) {
            return res.status(403).json({ status: "error", message: "권한이 없습니다." });
        }

        const success = await CommentController.commentService.Delete(commentId, true);
        if (!success) {
            return res.status(500).json({ status: "error", message: "댓글 삭제를 실패하였습니다." });
        }

        return res.status(200).json({ status: "success" });
    }
}