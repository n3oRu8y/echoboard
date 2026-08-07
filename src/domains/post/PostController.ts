import type { Request, Response } from "express";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import PostService from "./PostService.js";
import PostRepository from "./PostRepositorty.js";
import AttachmentRepository from "../attachment/AttachmentRepository.js";
import BoardService from "../board/BoardService.js";
import BoardRepo from "../board/BoardRepository.js";
import PostNotFound from "./exceptions/PostNotFound.js";
import CredentialFailed from "../../common/exceptions/CredentialFailed.js";
import AttachmentService from "../attachment/AttachmentService.js";
import TurnstileFailed from "../../infrastructures/turnstile/exceptions/TurnstileFailed.js";

export default class PostController {
    public static async CreatePost(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const { title, content, isAnonymous } = req.body;
        if (!title || !content || isAnonymous == undefined) {
            return res.status(400).json({ status: "error", message: "제목과 내용을 입력해주세요." });
        }

        const token = req.body.token as string;
        const ip = req.ip!;
        if (!token) {
            return res.status(400).json({ status: "error", message: "Turnstile 토큰이 입력되지 않았습니다." });
        }

        const boardUrl = req.params.boardUrl as string;
        const boardService = new BoardService(new BoardRepo());
        const board = await boardService.GetByUrl(boardUrl, true);
        if (!board) {
            return res.status(404).json({ status: "error", message: "게시판을 찾을 수 없습니다." });
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId);
        if (user.IsBanned()) {
            return res.status(403).json({ status: "error", message: "차단된 사용자입니다." });
        }

        if (!board.canWrite && user.role != "ADMIN") {
            return res.status(403).json({ status: "error", message: "게시판 쓰기 권한이 없습니다." });
        }

        const attachmentIds = Array.isArray(req.body.attachmentIds) ? req.body.attachmentIds : [];
        const imageIds = Array.isArray(req.body.imageIds) ? req.body.imageIds : [];

        if (attachmentIds.length > 5) {
            return res.status(400).json({ status: "error", message: "첨부파일은 5개까지 첨부 가능합니다." });
        }

        let sumOfSize = 0;
        const attachmentRepo = new AttachmentRepository();
        const attachmentService = new AttachmentService(attachmentRepo);
        const attachments = await attachmentService.GetAttachments(attachmentIds);
        for(const attachment of attachments) {
            sumOfSize += attachment.size;
        }

        if (sumOfSize > 50 * 1024 * 1024) {
            return res.status(400).json({ status: "error", message: "첨부파일은 50mb까지 첨부 가능합니다. "});
        }

        sumOfSize = 0;
        const images = await attachmentService.GetAttachments(imageIds);
        for(const image of images) {
            sumOfSize += image.size;
        }

        if (sumOfSize > 50 * 1024 * 1024) {
            return res.status(400).json({ status: "error", message: "이미지는 50mb까지 첨부 가능합니다. "});
        }

        const postService = new PostService(new PostRepository(), attachmentRepo);
        let post = null;
        try {
            post = await postService.CreatePost(user.id!, title, content, isAnonymous, board.id!, imageIds, attachmentIds, token, ip);
        } catch (e) {
            if (e instanceof TurnstileFailed) {
                return res.status(403).json({ status: "error", message: "보안 작업을 실패했습니다." });
            }
            throw e;
        }
        return res.status(201).json({ status: "success", data: { postId: post.id } });
    }

    public static async UpdatePost(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const token = req.body.token as string;
        const ip = req.ip!;
        if (!token) {
            return res.status(400).json({ status: "error", message: "Turnstile 토큰이 입력되지 않았습니다." });
        }

        const boardUrl = req.params.boardUrl as string;
        const boardService = new BoardService(new BoardRepo());
        const board = await boardService.GetByUrl(boardUrl, true);
        if (!board) {
            return res.status(404).json({ status: "error", message: "게시판을 찾을 수 없습니다." });
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId);
        if (user.IsBanned()) {
            return res.status(403).json({ status: "error", message: "차단된 사용자입니다." });
        }

        if (!board.canWrite && user.role != "ADMIN") {
            return res.status(403).json({ status: "error", message: "게시판 쓰기 권한이 없습니다." });
        }

        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 0) {
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다." });
        }

        const attachmentIds = Array.isArray(req.body.attachmentIds) ? req.body.attachmentIds : [];
        const imageIds = Array.isArray(req.body.imageIds) ? req.body.imageIds : [];

        if (attachmentIds.length > 5) {
            return res.status(400).json({ status: "error", message: "첨부파일은 5개까지 첨부 가능합니다." });
        }

        let sumOfSize = 0;
        const attachmentRepo = new AttachmentRepository();
        const attachmentService = new AttachmentService(attachmentRepo);
        const attachments = await attachmentService.GetAttachments(attachmentIds);
        for(const attachment of attachments) {
            sumOfSize += attachment.size;
        }

        if (sumOfSize > 50 * 1024 * 1024) {
            return res.status(400).json({ status: "error", message: "첨부파일은 50mb까지 첨부 가능합니다. "});
        }

        sumOfSize = 0;
        const images = await attachmentService.GetAttachments(imageIds);
        for(const image of images) {
            sumOfSize += image.size;
        }

        if (sumOfSize > 50 * 1024 * 1024) {
            return res.status(400).json({ status: "error", message: "이미지는 50mb까지 첨부 가능합니다. "});
        }

        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ status: "error", message: "제목과 내용을 입력해주세요." });
        }

        const postService = new PostService(new PostRepository(), new AttachmentRepository());
        try {
            await postService.UpdatePost(postId, boardUrl, user.id!, title, content, attachmentIds, token, ip);
        } catch (e) {
            if (e instanceof PostNotFound) {
                return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다." });
            } else if (e instanceof TurnstileFailed) {
                return res.status(403).json({ status: "error", message: "보안 작업을 실패했습니다." });
            }
                        
            throw e;
        }

        return res.status(201).json({ status: "success" });
    } 

    public static async DeletePost(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const boardUrl = req.params.boardUrl as string;
        const boardService = new BoardService(new BoardRepo());
        const board = await boardService.GetByUrl(boardUrl, true);
        if (!board) {
            return res.status(404).json({ status: "error", message: "게시판을 찾을 수 없습니다." });
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId);
        /* if (user.IsBanned()) {
            return res.status(403).json({ status: "error", message: "차단된 사용자입니다." });
        } */
       // 일단은 차단된 사용자도 삭제는 가능하게 수정

        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 0) {
            return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다." });
        }

        const postService = new PostService(new PostRepository(), new AttachmentRepository());
        try {
            await postService.DeletePost(postId, boardUrl, user);
        } catch (e) {
            if (e instanceof PostNotFound) {
                return res.status(404).json({ status: "error", message: "게시글을 찾을 수 없습니다." });
            } else if (e instanceof CredentialFailed) {
                return res.status(403).json({ status: "error", message: "본인 또는 작성자만 게시글을 삭제할 수 있습니다." });
            }
            throw e;
        }

        return res.status(201).json({ status: "success" });
    }
}
