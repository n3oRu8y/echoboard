import type { NextFunction, Request, Response } from "express";

export default function NotFound(req: Request, res: Response, next: NextFunction) {
    return res.status(404).json({ status: "error", message: "Service not found" });
}