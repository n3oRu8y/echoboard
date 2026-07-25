import type { Request, Response } from "express";
import BoardService from "../board/BoardService.js";
import BoardRepo from "../board/BoardRepository.js";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import dayjs from "dayjs";
import PostService from "./PostService.js";
import PostRepository from "./PostRepositorty.js";
import AttachmentRepository from "../attachment/AttachmentRepository.js";

export default class PostPageController {
    public static async Write(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId);
        if (user.IsBanned()) {
            return res.status(403).render("errors/alert.ejs", {
                message: `차단된 사용자입니다.\n차단 해제 시각: ${dayjs(user.bannedUntil).format("YYYY년 MM월 DD일 HH시 mm분 ss초")}\n차단 사유: ${user.banReason ? user.banReason : "사유 없음" }`
            });
        }

        const boardUrl = req.params.boardUrl;
        const boardService = new BoardService(new BoardRepo()); 
        const board = await boardService.GetByUrl(boardUrl as string, true);

        if (!board) {
            return res.status(404).render("errors/404.ejs");
        }

        if (!board.canWrite) {
            return res.status(403).render("errors/alert.ejs", { message: "쓰기 권한이 없습니다." });
        }

        return res.render("post/write.ejs", {
            title: "게시글 작성"
        });
    }

    public static async Update(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId);
        if (user.IsBanned()) {
            return res.status(403).render("errors/alert.ejs", {
                message: `차단된 사용자입니다.\n차단 해제 시각: ${dayjs(user.bannedUntil).format("YYYY년 MM월 DD일 HH시 mm분 ss초")}\n차단 사유: ${user.banReason ? user.banReason : "사유 없음" }`
            });
        }

        const boardUrl = req.params.boardUrl;
        const boardService = new BoardService(new BoardRepo()); 
        const board = await boardService.GetByUrl(boardUrl as string, true);

        if (!board) {
            return res.status(404).render("errors/404.ejs");
        }

        if (!board.canWrite) {
            return res.status(403).render("errors/alert.ejs", { message: "쓰기 권한이 없습니다." });
        }

        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 0)
            return res.status(404).render("errors/404.ejs");

        const postService = new PostService(new PostRepository(), new AttachmentRepository());
        const post = await postService.GetPost(postId, true);
        if (!post) {
            return res.status(404).render("errors/404.ejs");
        }

        if (post.author?.id != user.id) 
            return res.status(404).render("errors/404.ejs");

        const attachments = post.attachments?.filter(attachment => !attachment.isImage);
        const images = post.attachments?.filter(attachments => attachments.isImage);

        return res.render("post/edit.ejs", {
            post: post,
            attachments: attachments,
            images: images,
            title: "게시글 수정"
        });
    }

    public static async ReadPost(req: Request, res: Response) {
        const userService = new UserService(new UserRepo());
        const userId = req.session?.userId;
        let user = null;
        if (userId) {
            user = await userService.GetUserWithUserId(userId);
        }

        const boardUrl = req.params.boardUrl as string;
        const boardService = new BoardService(new BoardRepo());
        const board = await boardService.GetByUrl(boardUrl, true);
        if (!board) 
            return res.status(404).render("errors/404.ejs");

        if (!board.canRead)
            if (!user || user.role != "ADMIN")
                return res.status(403).render("errors/alert.ejs", { message: "권한이 없습니다." });

        const postId = Number(req.params.postId);
        if (!Number.isInteger(postId) || postId < 0)
            return res.status(404).render("errors/404.ejs");

        const postSeervice = new PostService(new PostRepository(), new AttachmentRepository());
        const post = await postSeervice.GetPost(postId, true);
        if (!post)
            return res.status(404).render("errors/404.ejs");

        return res.render("post/post.ejs", {
            post: post,
            user: user
        });
    }
}