import type { NextFunction, Request, Response } from "express";

export default function PageError(err: any, req: Request, res: Response, next: NextFunction) {
    return res.status(500).render("errors/500.ejs");
}