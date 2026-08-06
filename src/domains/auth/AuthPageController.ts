import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

const sitekey = process.env.HCAPTCHA_SITEKEY || "10000000-ffff-ffff-ffff-000000000001";
const JWT_SECRET = process.env.JWT_SECRET as string;

export default class AuthPageController {
    private constructor() {};
    static async Login(req: Request, res: Response) {
        if (req.session?.userId) {
            return res.redirect("/");
        }

        return res.render("auth/login.ejs", {
            title: "로그인"
        });
    }

    static async Register(req: Request, res: Response) {
        if (req.session?.userId) {
            return res.redirect("/");
        }

        return res.render("auth/register.ejs", {
            title: "회원가입",
            sitekey: sitekey
        });
    }

    static async TwoFactorPage(req: Request, res: Response) {
        if (req.session?.userId) {
            return res.redirect("/");
        }

        const token = req.cookies.pd;
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return res.render("auth/totp-verify.ejs", {
                title: "2단계 인증"
            });
        } catch {
            return res.redirect("/");
        }
    }
}