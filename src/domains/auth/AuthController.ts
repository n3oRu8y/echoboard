import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import { ConflictError } from "../../common/exceptions/ConflictError.js";
import TOTPService from "../../application/totp/TOTPService.js";
import CredentialFailed from "../../common/exceptions/CredentialFailed.js";
import HCaptchaFailed from "../../infrastructures/captcha/exceptions/HCaptchaFailed.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export default class AuthController {
    private constructor() {};

    private static userRepo = new UserRepo();
    private static userService = new UserService(AuthController.userRepo);
    private static totpService = new TOTPService(AuthController.userRepo);

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
        const user = await userService.GetUserWithUserId(userId!);
        if (user.twoFactorEnabled) {
            const token = req.cookies.dt as string;
            try {
                const decoded: any = jwt.verify(token, JWT_SECRET);
                if (decoded.userId != userId || decoded.status != "trusted")
                    throw new Error();
            } catch {
                const payload = {
                    userId: userId,
                    status: "pending"
                };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 5 * 60 });
                res.cookie("pd", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV == "production",
                    maxAge: 5 * 60 * 1000
                });
                return res.status(200).json({ status: "ok", message: "pending" });
            }
        }

        req.session.userId = userId!;

        return res.status(200).json({ status: "ok", message: "success" });
    }

    static async Register(req: Request, res: Response) {
        if (req.session?.userId) {
            return res.status(403).json({ status: "error", message: "이미 로그인 했습니다." });
        }

        const token = req.body.token as string;
        const ip = req.ip!;
        if (!token) {
            return res.status(400).json({ status: "error", message: "HCaptcha 토큰이 입력되지 않았습니다." });
        }

        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(401).json({ status: "error", message: "이메일, 아이디, 비밀번호를 입력해주세요. "});
        }

        const usernameRegex = /^[a-z][a-z0-9_]{3,19}$/;

        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                message: "아이디는 영문 소문자로 시작하며, 영문 소문자, 숫자, _(언더바)만 사용할 수 있고 4~20자여야 합니다."
            });
        }

        try {
            const userService = await new UserService(new UserRepo());
            await userService.Register(username, password, email, token, ip);
        } catch (e) {
            if (e instanceof ConflictError) {
                return res.status(409).json({ status: "error", message: "이메일 또는 아이디가 중복됩니다. "});
            } else if (e instanceof HCaptchaFailed) {
                return res.status(403).json({ status: "error", message: "HCaptcha 인증에 실패하였습니다." });
            }

            throw e;
        }

        return res.status(201).json({ status: "ok" });
    }

    static async Logout(req: Request, res: Response) {
        req.session.destroy(() => {
            return res.status(200).json({ status: "ok" });
        });
    }

    static async Enable2fa(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const { secret, token } = req.body;
        if (!secret || !token) {
            return res.status(400).json({ status: "error", message: "필수 인자 누락" });
        }

        const user = await AuthController.userService.GetUserWithUserId(req.session?.userId);
        if (user.twoFactorEnabled) {
            return res.status(409).json({ status: "error", message: "이미 2단계 인증이 활성화되어 있습니다." });
        }

        try {
            await AuthController.totpService.Enable(user.id!, secret, token);
        } catch (e) {
            if (e instanceof CredentialFailed) {
                return res.status(403).json({ status: "error", message: "2단계 인증 코드를 다시 확인해주세요." });
            }
            throw e;
        }

        return res.status(201).json({ status: "ok" });
    }

    static async Disable2fa(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ status: "error", message: "필수 인자 누락" });
        }

        const user = await AuthController.userService.GetUserWithUserId(req.session?.userId);
        if (!user.twoFactorEnabled) {
            return res.status(409).json({ status: "error", message: "2단계 인증이 비활성화되어 있습니다." });
        }
        
        try {
            await AuthController.totpService.Disable(user.id!, token);
        } catch (e) {
            if (e instanceof CredentialFailed) {
                return res.status(403).json({ status: "error", message: "2단계 인증 코드를 다시 확인해주세요." });
            }
            throw e;
        }

        return res.status(201).json({ status: "ok" });   
    }

    static async LoginWithTOTP(req: Request, res: Response) {
        if (req.session?.userId) {
            return res.status(403).json({ status: "error", message: "이미 로그인했습니다." });
        }

        const token = req.body.token;
        if (!token) {
            return res.status(400).json({ status: "error", mesage: "인증코드를 입력해주세요." });
        }

        const pdToken = req.cookies.pd;
        let decoded: any;
        try {
            decoded = jwt.verify(pdToken, JWT_SECRET);
        } catch {
            return res.status(403).json({ status: "error", message: "유효하지 않은 요청입니다." });
        }

        if (decoded.status != "pending") {
            return res.status(403).json({ status: "error", message: "유효하지 않은 요청입니다." });
        }

        const userId = decoded.userId;
        const user = await AuthController.userService.GetUserWithUserId(userId);
        if (!user.twoFactorEnabled) {
            return res.status(403).json({ status: "error", message: "유효하지 않은 요청입니다." });
        }

        const verified = await AuthController.totpService.Verify(userId, token);
        if (!verified) {
            return res.status(403).json({ status: "error", message: "인증코드를 다시 확인해주세요." });
        }

        const trustDevice = req.body.trustDevice;
        if (trustDevice) {
            const dt = jwt.sign({
                userId: userId,
                status: "trusted"
            }, JWT_SECRET, { expiresIn: "30d" });
            res.cookie("dt", dt, {
                httpOnly: true,
                secure: process.env.NODE_ENV == "production",
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
        }

        res.cookie("pd", undefined, { maxAge: 0 });
        req.session.userId = userId;

        return res.status(200).json({ status: "ok" });
    }
}