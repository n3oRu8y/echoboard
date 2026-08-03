import type { Request, Response } from "express";
import UserRepo from "./UserRepository.js";
import UserService from "./UserService.js";
import dayjs from "dayjs";
import TOTPService from "../../application/totp/TOTPService.js";
import QRCode from "qrcode";
import PostRepository from "../post/PostRepositorty.js";
import PostService from "../post/PostService.js";
import AttachmentRepository from "../attachment/AttachmentRepository.js";
import FormatDatetime from "../../common/utils/FormatDatetime.js";

export default class UserPageController {
    private constructor() {};

    private static Format(date: Date) {
        return dayjs(date).format("YYYY-MM-DD");
    }

    private static userRepo = new UserRepo();
    private static userService = new UserService(UserPageController.userRepo);
    private static totpService = new TOTPService(UserPageController.userRepo);

    private static postRepo = new PostRepository();
    private static attachmentRepo = new AttachmentRepository();
    private static postService = new PostService(UserPageController.postRepo, UserPageController.attachmentRepo);

    public static async MyPage(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        const user = await UserPageController.userService.GetUserWithUserId(req.session.userId, false, true);
        return res.render("user/mypage.ejs", {
            title: "마이페이지",
            user: user,
            Format: UserPageController.Format
        });
    }

    public static async Nickname(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        const user = await UserPageController.userService.GetUserWithUserId(req.session.userId);
        return res.render("user/nickname.ejs", {
            title: "닉네임 변경",
            user: user,
        });
    }

    public static async Password(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        const user = await UserPageController.userService.GetUserWithUserId(req.session.userId);
        return res.render("user/password.ejs", {
            title: "비밀번호 변경",
            user: user,
        });
    }

    public static async TwoFactorRegister(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        const user = await UserPageController.userService.GetUserWithUserId(req.session.userId);
        if (!user.twoFactorEnabled) {
            const result = await UserPageController.totpService.CreateSecret(user.id!, user.email);
            const qrCode = await QRCode.toDataURL(result.uri);
            return res.render("auth/totp-register.ejs", {
                title: "2단계 인증 설정",
                qrCode: qrCode,
                secret: result.secret
            });
        } else {
            return res.render("auth/totp-disable.ejs", {
                title: "2단계 인증 설정"
            });
        }
    }

    public static async WithdrawPage(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        return res.render("user/withdraw.ejs", { title: "회원탈퇴" });
    }

    public static async GetMyPosts(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        const query = req.query.query as string;
        let page = Number(req.query.page ?? 1);
        if (!Number.isInteger(page) || page <= 1) {
            page = 1;
        }

        const user = await UserPageController.userService.GetUserWithUserId(req.session.userId);
        const posts = await UserPageController.postService.GetUserPosts(req.session.userId, page, query);
        const postCount = await UserPageController.postService.GetUserPostCount(user.id!, query);

        const totalPages = postCount / 10 + 1;

        return res.render("user/posts.ejs", {
            title: "작성 글 목록",
            user: user,
            posts: posts,
            totalPages: totalPages,
            page: page,
            query: query,
            Format: FormatDatetime
        })
    }
};