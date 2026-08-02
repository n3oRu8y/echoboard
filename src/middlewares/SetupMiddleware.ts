import type { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma.js";

export async function SetupMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path === "/setup/admin") {
        return next();
    }

    const admin = await prisma.user.findFirst({
        where: {
            username: process.env.OWNER_NAME as string ?? "admin"
        }
    });

    if (!admin) {
        return res.redirect("/setup/admin");
    }

    next();
}