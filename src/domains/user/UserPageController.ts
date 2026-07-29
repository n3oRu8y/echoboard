import type { Request, Response } from "express";
import UserRepo from "./UserRepository.js";
import UserService from "./UserService.js";
import dayjs from "dayjs";

export default class UserPageController {
    private constructor() {};

    private static Format(date: Date) {
        return dayjs(date).format("YYYY-MM-DD");
    }

    private static userRepo = new UserRepo();
    private static userService = new UserService(this.userRepo);

    public static async MyPage(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.redirect("/login");
        }

        const user = await UserPageController.userService.GetUserWithUserId(req.session.userId);

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
}