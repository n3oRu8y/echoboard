import type { NextFunction, Request, Response } from "express";

export default function AdminCheck(req: Request, res: Response, next: NextFunction) {
    if (req.session?.user?.role != "ADMIN") {
        return res.status(404).render("errors/404.ejs");
    }
    return next();
}