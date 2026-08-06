import type { Request, Response } from "express";
import BoardService from "../board/BoardService.js";
import BoardRepo from "../board/BoardRepository.js";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import dayjs from "dayjs";
import PostService, { safe } from "./PostService.js";
import PostRepository from "./PostRepositorty.js";
import AttachmentRepository from "../attachment/AttachmentRepository.js";
import FormatDatetime from "../../common/utils/FormatDatetime.js";
import type Post from "./PostDomain.js";
import type User from "../user/UserDomain.js";

export default class PostPageController {
    private static CollectAuthorMap(post: Post): Map<string, number> {
        const authorMap = new Map<string, number>();
        let index = 1;

        const addAuthor = (author?: User | null) => {
            if (!author || authorMap.has(author.id!)) {
                return;
            }

            authorMap.set(author.id!, index++);
        };

        // addAuthor(post.author);

        for (const comment of post.comments ?? []) {
            if (comment.isAnonymous)
                addAuthor(comment.author);

            for (const reply of comment.replies ?? []) {
                if (reply.isAnonymous)
                    addAuthor(reply.author);
            }
        }

        return authorMap;
    }

    private static getDisplayAuthor(author: User, isAnonymous: boolean, post: Post, authorMap: Map<string, number>) {
        if (!isAnonymous) return author.nickname ?? author.username;

        if (author.id === post.authorId && isAnonymous && post.isAnonymous) return "익명(작성자)";

        return `익명 ${authorMap.get(author.id!)}`;
    }

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
        const post = await postSeervice.GetPost(postId, true, true);
        if (!post)
            return res.status(404).render("errors/404.ejs");

        const authorMap = PostPageController.CollectAuthorMap(post);
        for(let comment of post.comments) {
            comment.displayNick = PostPageController.getDisplayAuthor(comment.author!, comment.isAnonymous, post, authorMap);
            for(let reply of comment.replies!) {
                reply.displayNick = PostPageController.getDisplayAuthor(reply.author!, reply.isAnonymous, post, authorMap);
            }
        }

        post.content = safe(post.content); // XSS 필터링

        return res.render("post/post.ejs", {
            post: post,
            user: user,
            authorMap: authorMap,
            DateFormat: FormatDatetime,
            title: post.title
        });
    }
}