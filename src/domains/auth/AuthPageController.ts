import type { Request, Response } from "express";

const sitekey = process.env.HCAPTCHA_SITEKEY;

export default class AuthPageController {
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
}