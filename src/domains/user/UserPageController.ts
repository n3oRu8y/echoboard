import type { Request, Response } from "express";
import UserRepo from "./UserRepository.js";
import UserService from "./UserService.js";
import dayjs from "dayjs";
import TOTPService from "../../application/auth/TOTPService.js";
import QRCode from "qrcode";

export default class UserPageController {
    private constructor() {};

    private static Format(date: Date) {
        return dayjs(date).format("YYYY-MM-DD");
    }

    private static userRepo = new UserRepo();
    private static userService = new UserService(this.userRepo);
    private static totpService = new TOTPService(this.userRepo);

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
};