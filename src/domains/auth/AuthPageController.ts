import type { Request, Response } from "express";

export default class AuthPageController {
    static async Login(req: Request, res: Response) {
        if (req.session?.userId) {
            return res.redirect("/");
        }

        return res.render("auth/login.ejs");
    }
}