import express, { type Request, type Response } from "express";
import prisma from "../db/prisma.js";
import argon2 from "argon2";

const router = express.Router();

router.get("/admin", async (req: Request, res: Response) => {
    const admin = await prisma.user.findFirst({
        where: {
            username: process.env.OWNER_NAME as string ?? "admin"
        }
    });

    if (admin) {
        return res.status(404).render("errors/404.ejs");
    }

    res.render("setup.ejs", {
        title: "관리자 계정 생성",
        username: process.env.OWNER_NAME as string ?? "admin"
    });
});

router.post("/admin", async (req, res) => {
    const admin = await prisma.user.findFirst({
        where: {
            username: process.env.OWNER_NAME as string ?? "admin"
        }
    });

    if (admin) {
        return res.status(404).json({ status: "error", message: "Service not found" });
    }

    const { nickname, email, password } = req.body;

    const existUser = await prisma.user.findFirst({
        where: {
            OR: [
                {
                    username: process.env.OWNER_NAME as string ?? "admin"
                },
                {
                    nickname
                },
                {
                    email
                }
            ]
        }
    });

    if (existUser) {
        return res.status(409).send("이미 존재하는 계정입니다.");
    }

    const passwordHash = await argon2.hash(password);

    await prisma.user.create({
        data: {
            username: process.env.OWNER_NAME as string ?? "admin",
            nickname,
            email,
            password: passwordHash,
            role: "ADMIN"
        }
    });

    res.redirect("/login");
});

export default router;