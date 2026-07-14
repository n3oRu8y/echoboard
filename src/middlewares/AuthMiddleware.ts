import type { NextFunction, Request, Response } from "express";
import UserService from "../domains/user/UserService.js";
import UserRepo from "../domains/user/UserRepository.js";

export default async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    req.session.user = null;
    if (req.session?.userId) {
        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId, true);
        if (!user) {
            await new Promise<void>((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }

        req.session.user = user;
    }
    
    return next();
}