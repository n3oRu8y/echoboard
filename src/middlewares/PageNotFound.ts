import type { NextFunction, Request, Response } from "express";

export default function PageNotFound(req: Request, res: Response, next: NextFunction) {
    return res.status(404).render("errors/404.ejs");
}