import type { Request, Response } from "express";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import DuplicateUserData from "../user/exceptions/DuplicateUserData.js";

export default class AuthController {
    static async Login(req: Request, res: Response) {
        if (req.session?.userId) {
            return res.status(403).json({ status: "error", message: "이미 로그인했습니다." });
        }

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ status: "error", message: "아이디와 비밀번호를 입력해주세요." });
        }

        const userService = new UserService(new UserRepo());
        const success = await userService.Login(username, password);
        if (!success) {
            return res.status(403).json({ status: "error", message: "아이디와 비밀번호를 확인해주세요." });
        }

        const userId = await userService.GetUserIdWithUsername(username);
        req.session.userId = userId;

        return res.status(201).json({ status: "ok" });
    }

    static async Register(req: Request, res: Response) {
        if (req.session?.userId) {
            return res.status(403).json({ status: "error", message: "이미 로그인 했습니다." });
        }

        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(401).json({ status: "error", message: "이메일, 아이디, 비밀번호를 입력해주세요. "});
        }

        try {
            const userService = await new UserService(new UserRepo());
            await userService.Register(username, password, email);
        } catch (e) {
            if (e instanceof DuplicateUserData) {
                return res.status(409).json({ status: "error", message: "이메일 또는 아이디가 중복됩니다. "});
            }

            throw e;
        }

        return res.status(201).json({ status: "ok" });
    }
}