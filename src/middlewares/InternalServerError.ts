import type { NextFunction, Request, Response } from "express";

export default function InternalServerError(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    if (err.code) {
        return res.status(err.code).json({ status: "error", message: err.message });
    }
    return res.status(500).json({ status: "error", message: "Internal server error"});
}