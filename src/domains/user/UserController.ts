import type { Request, Response } from "express";
import UserRepo from "./UserRepository.js";
import UserService from "./UserService.js";
import ValidationException from "../../common/exceptions/ValidationException.js";
import CredentialFailed from "../../common/exceptions/CredentialFailed.js";
import UserNotFound from "./exceptions/UserNotFound.js";
import { ConflictError } from "../../common/exceptions/ConflictError.js";
import TOTPService from "../../application/totp/TOTPService.js";
import prisma from "../../db/prisma.js";
import TwoFactorNotEnabled from "../../application/totp/exceptions/TwoFactorNotEnabled.js";
import { InvalidRole } from "./exceptions/InvalidRole.js";

export default class UserControler {
    private constructor() {};

    private static userRepo = new UserRepo();
    private static userService = new UserService(UserControler.userRepo);
    private static totpService = new TOTPService(UserControler.userRepo);

    public static async Update(req: Request, res: Response) {
        if (!req.session.userId) {
            return res.status(401).json({ status: "error", message: "로그인 해주세요." });
        }

        const { nickname, password, email, bannedUntil, role} = req.body;
        const disable2fa = req.body.twoFactorEnabled === false;

        if (!nickname && !password && !email && !disable2fa && !bannedUntil && !role) {
            return res.status(400).json({ status: "error", message: "변경할 데이터를 입력해주세요." });
        }

        const sessionUser = await UserControler.userService.GetUserWithUserId(req.session.userId);
        let targetId = req.params.userId as string;
        if (targetId != "me" && targetId == sessionUser.id)
            return res.status(403).json({ status: "error", message: "자기 자신의 정보 변경은 마이페이지를 이용해주세요." });

        if (targetId == "me") {
            targetId = req.session.userId;
        }

        if (targetId != req.session.userId && sessionUser.role != "ADMIN") {
            return res.status(403).json({ status: "error", message: "권한이 없습니다." });
        }

        const user = await UserControler.userService.GetUserWithUserId(targetId, true);
        if (!user) {
            return res.status(404).json({ status: "error", message: "유저를 찾을 수 없습니다." });
        }

        let skipVerify = true;
        let oldPassword: string | null = null;
        if (password && (targetId == req.session.userId || sessionUser.role != "ADMIN")) {
            skipVerify = false;
            oldPassword = req.body.oldPassword;
            if (!oldPassword) {
                return res.status(401).json({ status: "error", message: "이전 비밀번호를 입력해주세요." });
            }
        }

        if ((disable2fa || bannedUntil) && sessionUser.role != "ADMIN") {
            return res.status(403).json({ status: "error", message: "권한이 없습니다." });
        }

        if (bannedUntil && Number.isNaN(new Date(bannedUntil).getTime())) {
            return res.status(400).json({ status: "error", message: "올바르지 않은 입력입니다." });
        }

        if (role && sessionUser.username != (process.env.OWNER_NAME ?? "admin")) {
            return res.status(403).json({ status: "error", message: "권한이 없습니다." });
        }

        try {
            await prisma.$transaction(async tx =>  {
                if (nickname) {
                    await UserControler.userService.ChangeNickname(targetId, nickname, tx);
                }

                if (password) {
                    await UserControler.userService.ChangePassword(targetId, password, oldPassword, skipVerify, tx);
                }

                if (email) {
                    await UserControler.userService.ChangeEmail(targetId, email, tx);
                }

                if (disable2fa) {
                    await UserControler.totpService.Disable(targetId, "", true, tx);
                }

                if (bannedUntil) {
                    const banReason = req.body.banReason ?? null;
                    await UserControler.userService.Ban(targetId, new Date(bannedUntil), banReason, tx);
                }

                if (role) {
                    await UserControler.userService.ChangeRole(targetId, role, tx);
                }
            });
        } catch (e) {
            if (e instanceof ValidationException) {
                return res.status(400).json({ status: "error", message: "닉네임은 한글, 영어, 숫자 2~12글자만 가능합니다." });
            } else if (e instanceof CredentialFailed) {
                return res.status(403).json({ status: "error", message: "비밀번호를 확인해주세요." });
            } else if (e instanceof ConflictError) {
                return res.status(409).json({ status: "error", message: "이메일이 중복됩니다." });
            } else if (e instanceof TwoFactorNotEnabled) {
                return res.status(409).json({ status: "error", message: "이 유저는 이미 2단계 인증이 비활성화 되어있습니다." });
            } else if (e instanceof InvalidRole) {
                return res.status(400).json({ status: "error", message: "올바르지 않은 역할입니다." });
            }

            throw e;
        }

        return res.status(200).json({ status: "ok" });
    } 

    public static async DeleteUser(req: Request, res: Response) {
        if (!req.session.userId) {
            return res.status(401).json({ status: "error", message: "로그인 해주세요." });
        }

        let targetId = req.params.userId as string;
        const user = await UserControler.userService.GetUserWithUserId(req.session?.userId);
        if (targetId == user.id) {
            return res.status(401).json({ status: "error", message: "자기 자신을 강제탈퇴시킬 수 없습니다." });
        }

        if (targetId != "me" && req.session?.userId) {
            return res.status(403).json({ status: "error", message: "권한이 없습니다." });
        }
    
        const isAdminAction = targetId != "me" ? true : false;
        if (targetId == "me") {
            targetId = req.session.userId;
        }

        const password = req.body.password ?? "";
        if (!password && !isAdminAction) {
            return res.status(400).json({ status: "error", message: "비밀번호를 입력해주세요."});
        }

        try {
            await UserControler.userService.Withraw(targetId, password, isAdminAction);
        } catch (e) {
            if (e instanceof UserNotFound) {
                return res.status(404).json({ status: "error", message: "유저를 찾을 수 없습니다." });
            } else if (e instanceof CredentialFailed) {
                return res.status(403).json({ status: "error", message: "비밀번호를 확인해주세요." });
            }
            throw e;
        }

        return res.status(200).json({ status: "ok" });
    }
}
