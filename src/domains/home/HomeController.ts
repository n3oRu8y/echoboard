import type { Request, Response } from "express";

export default class HomeController {
    public static HomePage(req: Request, res: Response) {
        return res.render("index.ejs", {
            title: "홈",
            user: req.session.user
        });
    }
}