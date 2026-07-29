import type { Request, Response } from "express";
import UserRepo from "./UserRepository.js";
import UserService from "./UserService.js";
import ValidationException from "../../common/exceptions/ValidationException.js";

export default class UserControler {
    private constructor() {};

    private static userRepo = new UserRepo();
    private static userService = new UserService(UserControler.userRepo);

    public static async Update(req: Request, res: Response) {
        if (!req.session.userId) {
            return res.status(401).json({ status: "error", message: "로그인 해주세요." });
        }

        const nickname = req.body.nickname as string;

        if (!nickname) {
            return res.status(400).json({ status: "error", message: "변경할 데이터를 입력해주세요." });
        }

        let targetId = req.params.userId as string;
        if (targetId == "me") {
            targetId = req.session.userId;
        }

        const sessionUser = await UserControler.userService.GetUserWithUserId(req.session.userId);
        if (targetId != req.session.userId && sessionUser.role != "ADMIN") {
            return res.status(403).json({ status: "error", json: "권한이 없습니다." });
        }

        const user = await UserControler.userService.GetUserWithUserId(targetId, true);
        if (!user) {
            return res.status(404).json({ status: "error", json: "유저를 찾을 수 없습니다." });
        }

        if (nickname) {
            try {
                await UserControler.userService.ChangeNickname(targetId, nickname);
            } catch (e) {
                if (e instanceof ValidationException) {
                    return res.status(400).json({ status: "error", message: "닉네임은 한글, 영어, 숫자 2~12글자만 가능합니다." });
                }
                throw e;
            }
        }

        return res.status(201).json({ status: "success" });
    } 
}